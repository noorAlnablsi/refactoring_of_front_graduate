import {
  SCREEN_INACTIVITY_MS,
  WINDOW_BLUR_DEBOUNCE_MS,
} from '../../constants/proctoring'
import { createStateChangeGate, debounce } from '../../lib/proctoring/eventThrottle'


export class BrowserMonitorService {
  constructor({
    onTabSwitch,
    onWindowBlur,
    onCopyPaste,
    onFullscreenExit,
    onSuspiciousNavigation,
    onScreenInactivity,
    settings = {},
  } = {}) {
    this.onTabSwitch = onTabSwitch
    this.onWindowBlur = onWindowBlur
    this.onCopyPaste = onCopyPaste
    this.onFullscreenExit = onFullscreenExit
    this.onSuspiciousNavigation = onSuspiciousNavigation
    this.onScreenInactivity = onScreenInactivity
    this.settings = settings

    this.running = false
    this.inactivityTimer = null
    this.tabHiddenGate = createStateChangeGate(false)
    this.emitBlur = debounce(() => this.onWindowBlur?.({}), WINDOW_BLUR_DEBOUNCE_MS)

    this.#boundVisibility = this.#handleVisibility.bind(this)
    this.#boundBlur = this.#handleBlur.bind(this)
    this.#boundFocus = this.#handleFocus.bind(this)
    this.#boundCopy = (e) => this.#handleClipboard(e, 'copy')
    this.#boundPaste = (e) => this.#handleClipboard(e, 'paste')
    this.#boundCut = (e) => this.#handleClipboard(e, 'cut')
    this.#boundFullscreen = this.#handleFullscreen.bind(this)
    this.#boundPopState = this.#handlePopState.bind(this)
    this.#boundBeforeUnload = this.#handleBeforeUnload.bind(this)
    this.#boundActivity = this.#resetInactivity.bind(this)
  }

  #boundVisibility
  #boundBlur
  #boundFocus
  #boundCopy
  #boundPaste
  #boundCut
  #boundFullscreen
  #boundPopState
  #boundBeforeUnload
  #boundActivity

  start() {
    if (this.running || typeof window === 'undefined') return
    this.running = true
    console.info('[BROWSER START]')

    const trackBrowser = this.settings.browser_window_tracking !== false
    const trackCopy = this.settings.prevent_copy_paste !== false
    const trackFullscreen = Boolean(this.settings.fullscreen_required)

    if (trackBrowser) {
      document.addEventListener('visibilitychange', this.#boundVisibility)
      window.addEventListener('blur', this.#boundBlur)
      window.addEventListener('focus', this.#boundFocus)
      window.addEventListener('popstate', this.#boundPopState)
      window.addEventListener('beforeunload', this.#boundBeforeUnload)
      ;['mousemove', 'keydown', 'click', 'touchstart'].forEach((evt) => {
        window.addEventListener(evt, this.#boundActivity, { passive: true })
      })
      this.#resetInactivity()
    }

    if (trackCopy) {
      document.addEventListener('copy', this.#boundCopy)
      document.addEventListener('paste', this.#boundPaste)
      document.addEventListener('cut', this.#boundCut)
    }

    if (trackFullscreen) {
      document.addEventListener('fullscreenchange', this.#boundFullscreen)
    }

    console.info('[BROWSER LISTENERS REGISTERED]')
  }

  #handleVisibility() {
    const hidden = Boolean(document.hidden)
    if (!this.tabHiddenGate.shouldEmit(hidden)) return
    if (hidden) {
      this.onTabSwitch?.({ hidden: true })
    }
  }

  #handleBlur() {
    if (document.hidden) return
    this.emitBlur()
  }

  #handleFocus() {
    this.emitBlur.cancel?.()
  }

  #handleClipboard(event, action) {

    if (this.settings.prevent_copy_paste) {
      try {
        event.preventDefault()
      } catch {

      }
    }
    this.onCopyPaste?.({ action })
  }

  #handleFullscreen() {
    if (!document.fullscreenElement) {
      this.onFullscreenExit?.({})
    }
  }

  #handlePopState() {
    this.onSuspiciousNavigation?.({ action: 'back' })
  }

  #handleBeforeUnload() {
    this.onSuspiciousNavigation?.({ action: 'refresh' })
  }

  #resetInactivity() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer)
    this.inactivityTimer = setTimeout(() => {
      this.onScreenInactivity?.({
        inactive_seconds: Math.round(SCREEN_INACTIVITY_MS / 1000),
      })
    }, SCREEN_INACTIVITY_MS)
  }

  stop() {
    if (!this.running) return
    this.running = false
    console.info('[BROWSER STOP]')

    document.removeEventListener('visibilitychange', this.#boundVisibility)
    window.removeEventListener('blur', this.#boundBlur)
    window.removeEventListener('focus', this.#boundFocus)
    window.removeEventListener('popstate', this.#boundPopState)
    window.removeEventListener('beforeunload', this.#boundBeforeUnload)
    ;['mousemove', 'keydown', 'click', 'touchstart'].forEach((evt) => {
      window.removeEventListener(evt, this.#boundActivity)
    })

    document.removeEventListener('copy', this.#boundCopy)
    document.removeEventListener('paste', this.#boundPaste)
    document.removeEventListener('cut', this.#boundCut)
    document.removeEventListener('fullscreenchange', this.#boundFullscreen)

    this.emitBlur.cancel?.()
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = null
    }
  }
}
