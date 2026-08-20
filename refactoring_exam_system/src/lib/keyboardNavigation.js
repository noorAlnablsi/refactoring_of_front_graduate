

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
  if (tag === 'SELECT') return true
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

export function isKeyboardOptionTarget(el) {
  if (!el || !(el instanceof Element)) return false
  return Boolean(el.closest('[data-keyboard-option]'))
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

function isOptionEnabled(el) {
  if (!(el instanceof HTMLElement)) return false
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return false
  return isElementVisible(el)
}

export function getKeyboardScope(root = document) {
  const modals = Array.from(root.querySelectorAll('[role="dialog"], [aria-modal="true"]')).filter(
    isElementVisible,
  )
  return modals.length > 0 ? modals[modals.length - 1] : root.body || root
}

function getOptionGroupRoot(active, scope) {
  if (active instanceof Element) {
    const group = active.closest('[data-keyboard-option-group]')
    if (group) return group
    const option = active.closest('[data-keyboard-option]')
    if (option) {
      const parentGroup = option.closest('[data-keyboard-option-group]')
      if (parentGroup) return parentGroup
    }
  }

  const firstGroup = scope.querySelector('[data-keyboard-option-group]')
  return firstGroup || scope
}

function listKeyboardOptions(groupRoot) {
  return Array.from(groupRoot.querySelectorAll('[data-keyboard-option]')).filter(isOptionEnabled)
}

export function moveKeyboardOption(delta) {
  const scope = getKeyboardScope()
  const active = document.activeElement
  const groupRoot = getOptionGroupRoot(active, scope)
  const options = listKeyboardOptions(groupRoot)
  if (options.length === 0) return false

  let index = -1
  if (active instanceof Element) {
    const current = active.closest('[data-keyboard-option]')
    if (current) index = options.indexOf(current)
  }

  if (index < 0) {
    index = delta > 0 ? -1 : 0
  }

  const nextIndex = (index + delta + options.length) % options.length
  const next = options[nextIndex]
  if (!next) return false

  next.focus()
  next.click()
  return true
}

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
