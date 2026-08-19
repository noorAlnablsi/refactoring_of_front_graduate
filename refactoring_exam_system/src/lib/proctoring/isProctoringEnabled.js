/**
 * Source of truth: the creator's master toggle.
 * Contract: settings_config.proctoring.enabled
 * Returns true | false | null (null = flag not present on this payload).
 */
function parseObject(value) {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch {
      return null
    }
  }
  return typeof value === 'object' ? value : null
}

function readExplicitBoolean(value) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1') return true
  if (value === 0 || value === '0') return false
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return null
}

function collectProctoringFlagCandidates(testOrSettings) {
  const nestedConfig =
    parseObject(testOrSettings.settings_config) || parseObject(testOrSettings.settings)
  const directConfig =
    nestedConfig ||
    (testOrSettings.proctoring ||
    testOrSettings.ai_proctoring_enabled != null ||
    testOrSettings.answer_rules
      ? testOrSettings
      : null)
  const topLevelProctoring = parseObject(testOrSettings.proctoring)

  return [
    nestedConfig?.proctoring?.enabled,
    directConfig?.proctoring?.enabled,
    topLevelProctoring?.enabled,
    testOrSettings.proctoring_enabled,
    nestedConfig?.ai_proctoring_enabled,
    directConfig?.ai_proctoring_enabled,
    testOrSettings.ai_proctoring_enabled,
  ]
}

export function readProctoringEnabledFlag(testOrSettings) {
  if (!testOrSettings || typeof testOrSettings !== 'object') return null

  for (const candidate of collectProctoringFlagCandidates(testOrSettings)) {
    const flag = readExplicitBoolean(candidate)
    if (flag != null) return flag
  }

  return null
}

export function isProctoringEnabled(testOrSettings) {
  return readProctoringEnabledFlag(testOrSettings) === true
}

export function getProctoringSettings(testOrSettings) {
  const config = parseObject(testOrSettings?.settings_config) || testOrSettings || {}
  return parseObject(config.proctoring) || {}
}
