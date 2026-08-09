import { useEffect } from 'react'
import {
  activatePrimaryAction,
  isActionTarget,
  isEditableTarget,
} from '../lib/keyboardNavigation'

/**
 * Platform keyboard behavior:
 * - Tab / Shift+Tab → left to the browser (no custom handler)
 * - Alt → not used for navigation
 * - Enter → primary action when focus is not already on a control/textarea/form field
 * - Space → native browser activation on focused buttons/checkboxes
 */
export function usePlatformKeyboardNav() {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' || event.defaultPrevented) return
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      if (isEditableTarget(target) && target.tagName === 'TEXTAREA') return
      if (target.isContentEditable) return
      if (isActionTarget(target)) return

      // Native form submit for text inputs inside forms.
      if (isEditableTarget(target) && target.closest('form')) return

      if (activatePrimaryAction()) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])
}

export default usePlatformKeyboardNav
