const STORAGE_PREFIX = 'exam-entry-rules:'

function storageKey(testId) {
  return `${STORAGE_PREFIX}${testId}`
}

/** Persist entry rules for Attempt page (require_answer_all, navigation, …). */
export function saveAttemptEntryRules(testId, rules) {
  if (!testId || !rules) return
  try {
    sessionStorage.setItem(
      storageKey(testId),
      JSON.stringify({
        allowBackNavigation: Boolean(rules.allowBackNavigation),
        allowSkipQuestions: Boolean(rules.allowSkipQuestions),
        requireAnswerAll: Boolean(rules.requireAnswerAll),
        maxAttempts: rules.maxAttempts ?? null,
        proctoringEnabled: Boolean(rules.proctoringEnabled),
      }),
    )
  } catch {
    // ignore
  }
}

export function loadAttemptEntryRules(testId) {
  if (!testId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(testId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function clearAttemptEntryRules(testId) {
  if (!testId) return
  try {
    sessionStorage.removeItem(storageKey(testId))
  } catch {
    // ignore
  }
}

/** Overlay entry/session rules onto nav settings from test.settings_config. */
export function applyEntryRulesToNavSettings(baseNav, entryRules) {
  if (!entryRules) return baseNav

  const requireAnswerAll =
    Boolean(entryRules.requireAnswerAll) || Boolean(baseNav.requireAnswerAll)

  return {
    ...baseNav,
    requireAnswerAll,
    allowSkipQuestions: requireAnswerAll
      ? false
      : typeof entryRules.allowSkipQuestions === 'boolean'
        ? entryRules.allowSkipQuestions
        : baseNav.allowSkipQuestions,
    allowBackNavigation:
      typeof entryRules.allowBackNavigation === 'boolean'
        ? entryRules.allowBackNavigation
        : baseNav.allowBackNavigation,
  }
}
