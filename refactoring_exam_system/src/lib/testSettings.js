import { TEST_AVAILABILITY_TIME_MODE } from '../constants/tests'
import { tUI } from './appToast'
import { toNaiveLocalDateTime } from './examPublishTime'

export function getDefaultSeverityPolicy() {
  return {
    action: tUI('settings.severity.actionDefault', { ns: 'exams' }),
    warning: tUI('settings.severity.warningDefault', { ns: 'exams' }),
  }
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
}

function isNestedSettingsConfig(config = {}) {
  return Boolean(
    config.answer_rules ||
      config.attempt_settings ||
      config.display_settings ||
      config.navigation_settings ||
      config.proctoring ||
      config.review_settings,
  )
}

function flattenNestedSettings(config = {}) {
  const answer = config.answer_rules || {}
  const attempt = config.attempt_settings || {}
  const display = config.display_settings || {}
  const navigation = config.navigation_settings || {}
  const proctoring = config.proctoring || {}
  const review = config.review_settings || {}

  const allowSkip =
    typeof answer.allow_skip_questions === 'boolean'
      ? answer.allow_skip_questions
      : typeof answer.require_answer_all === 'boolean'
        ? !answer.require_answer_all
        : DEFAULT_TEST_SETTINGS.allow_skip_questions

  const allowBack =
    typeof navigation.allow_back_navigation === 'boolean'
      ? navigation.allow_back_navigation
      : typeof navigation.sequential_navigation === 'boolean'
        ? !navigation.sequential_navigation
        : DEFAULT_TEST_SETTINGS.allow_back_navigation

  const proctoringEnabled =
    typeof proctoring.enabled === 'boolean'
      ? proctoring.enabled
      : DEFAULT_TEST_SETTINGS.ai_proctoring_enabled

  return {
    ...DEFAULT_TEST_SETTINGS,
    allow_skip_questions: allowSkip,
    require_all_answers: !allowSkip,
    allow_back_navigation: allowBack,
    force_sequential_navigation: !allowBack,
    shuffle_questions:
      display.shuffle_questions ?? DEFAULT_TEST_SETTINGS.shuffle_questions,
    shuffle_choices: display.shuffle_choices ?? DEFAULT_TEST_SETTINGS.shuffle_choices,
    max_attempts: attempt.max_attempts ?? DEFAULT_TEST_SETTINGS.max_attempts,
    allow_review:
      review.allow_review_after_grading ??
      review.allow_review ??
      DEFAULT_TEST_SETTINGS.allow_review,
    ai_proctoring_enabled: proctoringEnabled,
    face_tracking_enabled: proctoring.face_tracking_enabled ?? proctoringEnabled,
    ambient_sound_monitoring: proctoring.ambient_sound_monitoring ?? false,
    browser_window_tracking: proctoring.browser_window_tracking ?? proctoringEnabled,
    prevent_copy_paste: proctoring.prevent_copy_paste ?? true,
    tab_switch_limit: proctoring.tab_switch_limit ?? DEFAULT_TEST_SETTINGS.tab_switch_limit,
    fullscreen_required: proctoring.fullscreen_required ?? false,
    severity_policy: {
      ...getDefaultSeverityPolicy(),
      ...(proctoring.severity_policy || {}),
    },
  }
}

export function normalizeSettingsConfig(existing = {}) {
  if (!existing || typeof existing !== 'object') {
    return {
      ...DEFAULT_TEST_SETTINGS,
      severity_policy: getDefaultSeverityPolicy(),
    }
  }

  if (isNestedSettingsConfig(existing)) {
    return flattenNestedSettings(existing)
  }

  const severity = {
    ...getDefaultSeverityPolicy(),
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
  } else if (typeof existing.require_answer_all === 'boolean') {
    allowSkip = !existing.require_answer_all
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

/** Serialize UI flat settings into nested backend settings_config. */
export function serializeSettingsConfig(flatSettings = {}) {
  const settings = syncAiProctoringFlag(flatSettings)
  const allowSkip = Boolean(settings.allow_skip_questions)
  const allowBack = Boolean(settings.allow_back_navigation)
  const proctoringEnabled = Boolean(settings.ai_proctoring_enabled)

  return {
    answer_rules: {
      allow_skip_questions: allowSkip,
      require_answer_all: !allowSkip,
    },
    attempt_settings: {
      max_attempts: Number(settings.max_attempts) || 1,
    },
    display_settings: {
      shuffle_choices: Boolean(settings.shuffle_choices),
      shuffle_questions: Boolean(settings.shuffle_questions),
    },
    navigation_settings: {
      allow_back_navigation: allowBack,
      sequential_navigation: !allowBack,
    },
    proctoring: {
      enabled: proctoringEnabled,
      face_tracking_enabled: Boolean(settings.face_tracking_enabled),
      ambient_sound_monitoring: Boolean(settings.ambient_sound_monitoring),
      browser_window_tracking: Boolean(settings.browser_window_tracking),
      prevent_copy_paste: Boolean(settings.prevent_copy_paste),
      tab_switch_limit: Number(settings.tab_switch_limit) || 3,
      fullscreen_required: Boolean(settings.fullscreen_required),
      severity_policy: settings.severity_policy || getDefaultSeverityPolicy(),
    },
    review_settings: {
      allow_review_after_grading: Boolean(settings.allow_review),
    },
  }
}

/** Max / default entry window = floor(duration / 4), at least 1 minute. */
export function getMaxEntryWindowMinutes(durationMinutes) {
  const duration = Math.max(1, Number(durationMinutes) || 1)
  return Math.max(1, Math.floor(duration / 4))
}

export function clampEntryWindowMinutes(value, durationMinutes) {
  const max = getMaxEntryWindowMinutes(durationMinutes)
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return Math.min(1, max)
  return Math.min(Math.floor(n), max)
}

/**
 * Backend APP_TIMEZONE (Asia/Damascus): dates are naive local wall-clock, no Z/offset.
 * datetime-local already produces that wall-clock — never convert via toISOString().
 */
export function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  // Prefer slicing naive API strings so we never shift by UTC.
  const match = String(iso).match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/)
  if (match) {
    return `${match[1]}T${match[2]}:${match[3]}`
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(localValue) {
  if (!localValue) return null
  const raw = String(localValue).trim()
  // datetime-local: "YYYY-MM-DDTHH:mm" → send seconds, no timezone suffix
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) {
    return raw.slice(0, 19)
  }
  return toNaiveLocalDateTime(raw)
}

function resolveAvailabilityTimeMode(test) {
  const mode = test?.availability_time_mode || test?.availability_mode
  if (mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED) {
    return TEST_AVAILABILITY_TIME_MODE.SCHEDULED
  }
  return TEST_AVAILABILITY_TIME_MODE.FLEXIBLE
}

export function buildTestSettingsFormState(test) {
  const existing = test?.settings_config || {}
  const cfg = normalizeSettingsConfig(existing)
  const durationMinutes = test?.duration_minutes || 60
  const mode = resolveAvailabilityTimeMode(test)
  const maxEntry = getMaxEntryWindowMinutes(durationMinutes)

  return {
    duration_minutes: durationMinutes,
    max_attempts: cfg.max_attempts ?? 1,
    availability_time_mode: mode,
    starts_at: mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED ? test?.starts_at || null : null,
    entry_window_minutes:
      mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED
        ? clampEntryWindowMinutes(test?.entry_window_minutes ?? maxEntry, durationMinutes)
        : null,
    settings_config: cfg,
  }
}

export function buildTestSettingsPayload(form) {
  const flat = syncAiProctoringFlag({
    ...form.settings_config,
    max_attempts: Number(form.max_attempts) || 1,
  })
  const durationMinutes = Number(form.duration_minutes) || 60
  const mode =
    form.availability_time_mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED
      ? TEST_AVAILABILITY_TIME_MODE.SCHEDULED
      : TEST_AVAILABILITY_TIME_MODE.FLEXIBLE

  const payload = {
    duration_minutes: durationMinutes,
    availability_time_mode: mode,
    settings_config: serializeSettingsConfig(flat),
  }

  if (mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED) {
    payload.starts_at = form.starts_at || null
    payload.entry_window_minutes = clampEntryWindowMinutes(
      form.entry_window_minutes ?? getMaxEntryWindowMinutes(durationMinutes),
      durationMinutes,
    )
  } else {
    payload.starts_at = null
    payload.entry_window_minutes = null
  }

  return payload
}
