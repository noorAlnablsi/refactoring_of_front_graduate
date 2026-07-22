const STORAGE_PREFIX = 'exam-attempt-draft:'

function getStorageKey(testId, attemptId) {
  return `${STORAGE_PREFIX}${testId}:${attemptId}`
}

export function loadAttemptLocalDraft(testId, attemptId) {
  if (!testId || !attemptId) return null

  try {
    const raw = localStorage.getItem(getStorageKey(testId, attemptId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function saveAttemptLocalDraft(testId, attemptId, draft) {
  if (!testId || !attemptId || !draft) return

  try {
    localStorage.setItem(
      getStorageKey(testId, attemptId),
      JSON.stringify({
        ...draft,
        updatedAt: new Date().toISOString(),
      }),
    )
  } catch {
    // quota / private mode — exam continues in memory
  }
}

export function clearAttemptLocalDraft(testId, attemptId) {
  if (!testId || !attemptId) return

  try {
    localStorage.removeItem(getStorageKey(testId, attemptId))
  } catch {
    // ignore
  }
}

/** Local draft overlays server answers for the same attempt. */
export function mergeAnswersWithLocalDraft(serverMap = {}, localMap = {}) {
  if (!localMap || typeof localMap !== 'object') return { ...serverMap }
  return { ...serverMap, ...localMap }
}

export function applyLocalDraftToAttemptState(draft, { serverAnswersMap, questionsLength }) {
  if (!draft) {
    return {
      answersMap: serverAnswersMap,
      markedIds: new Set(),
      currentIndex: 0,
    }
  }

  const answersMap = mergeAnswersWithLocalDraft(serverAnswersMap, draft.answersMap)
  const markedIds = Array.isArray(draft.markedIds) ? new Set(draft.markedIds) : new Set()

  let currentIndex = 0
  if (typeof draft.currentIndex === 'number' && questionsLength > 0) {
    currentIndex = Math.min(Math.max(0, draft.currentIndex), questionsLength - 1)
  }

  return { answersMap, markedIds, currentIndex }
}
