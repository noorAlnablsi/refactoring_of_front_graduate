const STORAGE_PREFIX = 'exam-attempt-offline:'

function storageKey(testId, attemptId) {
  return `${STORAGE_PREFIX}${testId}:${attemptId}`
}

export function loadAttemptOfflineState(testId, attemptId) {
  if (!testId || !attemptId) return null
  try {
    const raw = localStorage.getItem(storageKey(testId, attemptId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveAttemptOfflineState(testId, attemptId, state) {
  if (!testId || !attemptId || !state) return
  try {
    localStorage.setItem(
      storageKey(testId, attemptId),
      JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString(),
      }),
    )
  } catch {

  }
}

export function clearAttemptOfflineState(testId, attemptId) {
  if (!testId || !attemptId) return
  try {
    localStorage.removeItem(storageKey(testId, attemptId))
  } catch {

  }
}
