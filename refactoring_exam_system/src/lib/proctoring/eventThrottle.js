export function debounce(fn, waitMs) {
  let timer = null

  const debounced = (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, waitMs)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

export function throttle(fn, waitMs) {
  let last = 0
  let trailingTimer = null

  const throttled = (...args) => {
    const now = Date.now()
    const remaining = waitMs - (now - last)

    if (remaining <= 0) {
      if (trailingTimer) {
        clearTimeout(trailingTimer)
        trailingTimer = null
      }
      last = now
      fn(...args)
      return
    }

    if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        last = Date.now()
        trailingTimer = null
        fn(...args)
      }, remaining)
    }
  }

  throttled.cancel = () => {
    if (trailingTimer) {
      clearTimeout(trailingTimer)
      trailingTimer = null
    }
  }

  return throttled
}

/**
 * Emit only when value changes (optional equality).
 */
export function createStateChangeGate(initialValue = undefined) {
  let current = initialValue

  return {
    shouldEmit(next, equals = Object.is) {
      if (equals(current, next)) return false
      current = next
      return true
    },
    reset(value = undefined) {
      current = value
    },
    get value() {
      return current
    },
  }
}
