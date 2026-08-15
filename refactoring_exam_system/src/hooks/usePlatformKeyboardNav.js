import { useEffect } from 'react'
import {
  activatePrimaryAction,
  isActionTarget,
  isEditableTarget,
  isKeyboardOptionTarget,
  moveKeyboardOption,
} from '../lib/keyboardNavigation'

function getArrowStep(key) {
  if (key === 'ArrowDown') return 1
  if (key === 'ArrowUp') return -1

  const rtl = document.documentElement.getAttribute('dir') === 'rtl'
  if (key === 'ArrowLeft') return rtl ? 1 : -1
  if (key === 'ArrowRight') return rtl ? -1 : 1
  return 0
}

/**
 * Platform keyboard behavior:
 * - Tab / Shift+Tab → left to the browser (no custom handler)
 * - Arrow keys → move between [data-keyboard-option] (focus + select)
 * - Enter on option → activate [data-keyboard-primary] (e.g. التالي)
 * - Enter elsewhere → primary / form submit when not already on a normal control
 * - Space → native browser activation on focused buttons/checkboxes
 */
export function usePlatformKeyboardNav() {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      if (isEditableTarget(target)) {
        return
      }

      const arrowStep = getArrowStep(event.key)
      if (arrowStep !== 0) {
        if (event.shiftKey) return
        if (moveKeyboardOption(arrowStep)) {
          event.preventDefault()
        }
        return
      }

      if (event.key !== 'Enter' || event.shiftKey) return

      // Option cards: Enter runs primary CTA (التالي), not only toggles selection.
      if (isKeyboardOptionTarget(target)) {
        if (activatePrimaryAction()) {
          event.preventDefault()
        }
        return
      }

      if (isActionTarget(target)) return

      if (activatePrimaryAction()) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])
}

export default usePlatformKeyboardNav
