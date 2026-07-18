/**
 * Returns true when backend nested settings enable proctoring.
 * Contract: settings_config.proctoring.enabled
 */
export function isProctoringEnabled(testOrSettings) {
  if (!testOrSettings) return false

  const config = testOrSettings.settings_config || testOrSettings
  const proctoring = config?.proctoring

  if (typeof proctoring?.enabled === 'boolean') {
    return proctoring.enabled
  }

  // Flat legacy UI field (wizard) — only used if nested shape absent
  if (typeof config?.ai_proctoring_enabled === 'boolean') {
    return config.ai_proctoring_enabled
  }

  return false
}

export function getProctoringSettings(testOrSettings) {
  const config = testOrSettings?.settings_config || testOrSettings || {}
  return config.proctoring || {}
}
