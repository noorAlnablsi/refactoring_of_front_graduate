/** Shared keyboard helpers. Tab/Shift+Tab stay native to the browser. */

export function isEditableTarget(el) {
  if (!el || !(el instanceof Element)) return false
  const tag = el.tagName
  if (tag === 'TEXTAREA') return true
  if (el.isContentEditable) return true
  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase()
    return !['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'hidden', 'image'].includes(
      type,
    )
  }
  return false
}

export function isActionTarget(el) {
  if (!el || !(el instanceof Element)) return false
  const tag = el.tagName
  if (tag === 'BUTTON' || tag === 'A') return true
  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || '').toLowerCase()
    return ['button', 'submit', 'reset', 'image'].includes(type)
  }
  return el.getAttribute('role') === 'button'
}

function isElementVisible(el) {
  if (!el || !(el instanceof Element)) return false
  if (el.closest('[hidden], [aria-hidden="true"]')) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

export function getKeyboardScope(root = document) {
  const modals = Array.from(root.querySelectorAll('[role="dialog"], [aria-modal="true"]')).filter(
    isElementVisible,
  )
  return modals.length > 0 ? modals[modals.length - 1] : root.body || root
}

/** Enter activates marked primary control or submits the relevant form. */
export function activatePrimaryAction() {
  const scope = getKeyboardScope()

  const marked = scope.querySelector(
    '[data-keyboard-primary]:not([disabled]):not([aria-disabled="true"])',
  )
  if (marked && isElementVisible(marked)) {
    marked.click()
    return true
  }

  const active = document.activeElement
  const form = active instanceof Element ? active.closest('form') : null
  if (form && typeof form.requestSubmit === 'function') {
    const submitter = form.querySelector(
      'button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])',
    )
    if (submitter && isElementVisible(submitter)) {
      form.requestSubmit(submitter)
      return true
    }
  }

  const scopedForm = scope.querySelector('form')
  if (scopedForm && typeof scopedForm.requestSubmit === 'function') {
    const submitter = scopedForm.querySelector(
      'button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])',
    )
    if (submitter && isElementVisible(submitter)) {
      scopedForm.requestSubmit(submitter)
      return true
    }
  }

  return false
}
