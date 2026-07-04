export const DEFAULT_SEVERITY_POLICY = {
  action:
    'إنهاء محاولة الامتحان فوراً عند اكتشاف وجه إضافي أو تبديل النافذة 3 مرات.',
  warning: 'إظهار رسالة تحذيرية للطالب عند الكشف عن صوت مرتفع في المحيط.',
}

export const DEFAULT_TEST_SETTINGS = {
  allow_review: true,
  shuffle_questions: true,
  shuffle_choices: true,
  force_sequential_navigation: false,
  allow_back_navigation: true,
  require_all_answers: false,
  allow_skip_questions: true,
  show_results_immediately: false,
  max_attempts: 1,
  ai_proctoring_enabled: true,
  face_tracking_enabled: true,
  ambient_sound_monitoring: false,
  browser_window_tracking: true,
  prevent_copy_paste: true,
  tab_switch_limit: 3,
  fullscreen_required: false,
  severity_policy: DEFAULT_SEVERITY_POLICY,
}

export function normalizeSettingsConfig(existing = {}) {
  const severity = {
    ...DEFAULT_SEVERITY_POLICY,
    ...(existing.severity_policy || {}),
  }

  let allowBack = DEFAULT_TEST_SETTINGS.allow_back_navigation
  if (typeof existing.allow_back_navigation === 'boolean') {
    allowBack = existing.allow_back_navigation
  } else if (typeof existing.force_sequential_navigation === 'boolean') {
    allowBack = !existing.force_sequential_navigation
  }

  let allowSkip = DEFAULT_TEST_SETTINGS.allow_skip_questions
  if (typeof existing.allow_skip_questions === 'boolean') {
    allowSkip = existing.allow_skip_questions
  } else if (typeof existing.require_all_answers === 'boolean') {
    allowSkip = !existing.require_all_answers
  }

  return {
    ...DEFAULT_TEST_SETTINGS,
    ...existing,
    allow_back_navigation: allowBack,
    force_sequential_navigation: !allowBack,
    allow_skip_questions: allowSkip,
    require_all_answers: !allowSkip,
    severity_policy: severity,
    face_tracking_enabled:
      existing.face_tracking_enabled ?? existing.ai_proctoring_enabled ?? true,
    browser_window_tracking:
      existing.browser_window_tracking ?? existing.ai_proctoring_enabled ?? true,
    prevent_copy_paste: existing.prevent_copy_paste ?? true,
  }
}

export function isAiMonitoringActive(settings = {}) {
  return Boolean(
    settings.ai_proctoring_enabled ||
      settings.face_tracking_enabled ||
      settings.ambient_sound_monitoring ||
      settings.browser_window_tracking ||
      settings.prevent_copy_paste,
  )
}

export function syncAiProctoringFlag(settings) {
  const active = isAiMonitoringActive(settings)
  return { ...settings, ai_proctoring_enabled: active }
}

export function buildTestSettingsFormState(test) {
  const existing = test?.settings_config || {}
  const cfg = normalizeSettingsConfig(existing)

  return {
    duration_minutes: test?.duration_minutes || 60,
    max_attempts: cfg.max_attempts ?? 1,
    settings_config: cfg,
  }
}

export function buildTestSettingsPayload(form) {
  const settings = syncAiProctoringFlag({
    ...form.settings_config,
    max_attempts: Number(form.max_attempts) || 1,
  })

  return {
    duration_minutes: Number(form.duration_minutes) || 60,
    settings_config: settings,
  }
}
