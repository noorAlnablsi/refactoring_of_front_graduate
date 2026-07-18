import {
  PROCTORING_CONNECTION_STATE,
  WS_RECONNECT_DELAY_MS,
} from '../../constants/proctoring'

/**
 * Native WebSocket wrapper for proctoring.
 * Does not invent protocols — sends { type, payload } only.
 */
export class WebSocketManager {
  constructor({ url, onMessage, onStateChange, onOpen, onClose, onError } = {}) {
    this.url = url
    this.onMessage = onMessage
    this.onStateChange = onStateChange
    this.onOpen = onOpen
    this.onClose = onClose
    this.onError = onError

    this.socket = null
    this.state = PROCTORING_CONNECTION_STATE.DISCONNECTED
    this.shouldReconnect = false
    this.reconnectTimer = null
    this.manualClose = false
  }

  #setState(next) {
    this.state = next
    this.onStateChange?.(next)
  }

  connect({ reconnect = true } = {}) {
    this.manualClose = false
    this.shouldReconnect = reconnect
    this.#clearReconnect()

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.#setState(PROCTORING_CONNECTION_STATE.CONNECTING)

    try {
      this.socket = new WebSocket(this.url)
    } catch (error) {
      this.#setState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
      this.onError?.(error)
      this.#scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this.#setState(PROCTORING_CONNECTION_STATE.CONNECTED)
      this.onOpen?.()
    }

    this.socket.onmessage = (event) => {
      let data = event.data
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      } catch {
        // keep raw
      }
      this.onMessage?.(data)
    }

    this.socket.onerror = (event) => {
      this.onError?.(event)
    }

    this.socket.onclose = () => {
      this.socket = null
      if (this.manualClose) {
        this.#setState(PROCTORING_CONNECTION_STATE.CLOSED)
        this.onClose?.({ intentional: true })
        return
      }

      this.#setState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
      this.onClose?.({ intentional: false })
      this.#scheduleReconnect()
    }
  }

  send(type, payload = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }

    this.socket.send(JSON.stringify({ type, payload }))
    return true
  }

  isOpen() {
    return Boolean(this.socket && this.socket.readyState === WebSocket.OPEN)
  }

  close() {
    this.manualClose = true
    this.shouldReconnect = false
    this.#clearReconnect()

    if (this.socket) {
      try {
        this.socket.close()
      } catch {
        // ignore
      }
      this.socket = null
    }

    this.#setState(PROCTORING_CONNECTION_STATE.CLOSED)
  }

  destroy() {
    this.close()
    this.onMessage = null
    this.onStateChange = null
    this.onOpen = null
    this.onClose = null
    this.onError = null
  }

  #scheduleReconnect() {
    if (!this.shouldReconnect || this.manualClose) return
    this.#clearReconnect()
    this.reconnectTimer = setTimeout(() => {
      this.connect({ reconnect: true })
    }, WS_RECONNECT_DELAY_MS)
  }

  #clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
