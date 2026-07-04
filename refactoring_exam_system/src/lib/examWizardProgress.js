const STORAGE_PREFIX = 'exam-wizard-progress:'

export const EXAM_QUESTIONS_VIEWS = {
  METHOD_PICKER: 'method-picker',
  FROM_BANK_QUESTIONS: 'from-bank-questions',
  MANUAL: 'manual',
  RANDOM_BLUEPRINT: 'random-blueprint',
  REVIEW: 'review',
}

function getStorageKey(testId) {
  return `${STORAGE_PREFIX}${testId}`
}

export function getExamWizardProgress(testId) {
  if (!testId) return null

  try {
    const raw = localStorage.getItem(getStorageKey(testId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveExamWizardProgress(testId, progress) {
  if (!testId || !progress) return

  const current = getExamWizardProgress(testId) || {}
  const next = {
    ...current,
    ...progress,
    updatedAt: new Date().toISOString(),
  }

  if (progress.questions === null) {
    delete next.questions
  }

  localStorage.setItem(getStorageKey(testId), JSON.stringify(next))
}

export function clearExamWizardProgress(testId) {
  if (!testId) return
  localStorage.removeItem(getStorageKey(testId))
}

export function getResumeWizardStep(test, progress) {
  if (progress?.step) return progress.step

  const questionsCount = test?.questions?.length ?? 0
  return questionsCount > 0 ? 2 : 1
}
