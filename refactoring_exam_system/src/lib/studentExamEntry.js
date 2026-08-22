function parsePositiveInt(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return null
  return Math.floor(parsed)
}

function firstPositiveInt(...candidates) {
  for (const value of candidates) {
    const parsed = parsePositiveInt(value)
    if (parsed != null) return parsed
  }
  return null
}

function resolveMaxAttemptsFromSources({ rules = {}, settingsConfig = {}, authoritativeMax = null } = {}) {
  const attemptSettings = settingsConfig.attempt_settings || {}
  return firstPositiveInt(
    authoritativeMax,
    attemptSettings.max_attempts,
    settingsConfig.max_attempts,
    rules.max_attempts,
    rules.maxAttempts,
  )
}

function buildEntryAccessState({
  canStart,
  resumeAttemptId,
  alreadyStarted,
  remainingAttempts,
  maxAttempts,
  rulesMaxAttempts = null,
}) {
  const canResume = Boolean(resumeAttemptId)
  let mayProceed = canResume || canStart
  let blockReason = null

  // Only soft-unlock when we positively know settings allow more than one attempt.
  // Do NOT unlock on a bare remaining=0 + max=1 — backend will 409 and confuse the student.
  const enrichedHigherMaxGate =
    !mayProceed &&
    remainingAttempts === 0 &&
    maxAttempts != null &&
    maxAttempts > 1 &&
    (rulesMaxAttempts == null || rulesMaxAttempts <= 1)

  if (enrichedHigherMaxGate) {
    mayProceed = true
  }

  if (!mayProceed) {
    if (alreadyStarted && !canResume && remainingAttempts !== 0) {
      blockReason = 'already_completed'
    } else if (remainingAttempts === 0) {
      blockReason = 'max_attempts'
    } else if (alreadyStarted && !canResume) {
      blockReason = 'already_completed'
    } else {
      blockReason = 'unavailable'
    }
  }

  return { mayProceed, blockReason, canResume }
}

/**
 * Apply authoritative max_attempts from student-accessible sources
 * (entry payload / available lists) onto a normalized entry.
 * Used when entry.rules.max_attempts is stale/wrong relative to saved settings_config.
 */
export function applyAuthoritativeMaxAttempts(entry, authoritativeMaxAttempts) {
  if (!entry || typeof entry !== 'object') return entry

  const nextMax = parsePositiveInt(authoritativeMaxAttempts)
  if (nextMax == null) return entry

  const rulesMaxAttempts =
    entry.rules?.maxAttempts != null ? parsePositiveInt(entry.rules.maxAttempts) : null
  const remainingAttempts = entry.student?.remainingAttempts
  const access = buildEntryAccessState({
    canStart: Boolean(entry.student?.canStart),
    resumeAttemptId: entry.student?.resumeAttemptId,
    alreadyStarted: Boolean(entry.student?.alreadyStarted),
    remainingAttempts:
      remainingAttempts == null || remainingAttempts === ''
        ? null
        : Number(remainingAttempts),
    maxAttempts: nextMax,
    rulesMaxAttempts,
  })

  return {
    ...entry,
    rules: {
      ...entry.rules,
      maxAttempts: nextMax,
    },
    mayProceed: access.mayProceed,
    blockReason: access.blockReason,
  }
}

export function normalizeStudentTestEntry(data = {}) {
  const exam = data.exam || {}
  const subject = exam.subject || {}
  const teacher = exam.teacher || {}
  const student = data.student || {}
  const summary = data.summary || {}
  const time = data.time || {}
  const rules = data.rules || {}
  const settingsConfig = data.settings_config || exam.settings_config || {}
  const answerRules = settingsConfig.answer_rules || {}
  const attemptSettings = settingsConfig.attempt_settings || {}
  const navigation = settingsConfig.navigation_settings || {}
  const instructions = Array.isArray(data.instructions) ? data.instructions.filter(Boolean) : []

  const durationMinutes = time.duration_minutes ?? time.durationMinutes ?? null
  const questionsCount = summary.questions_count ?? summary.questionsCount ?? 0
  const proctoringCfg = settingsConfig.proctoring || {}
  const proctoringEnabled = Boolean(
    rules.proctoring_enabled ??
      rules.proctoringEnabled ??
      proctoringCfg.enabled,
  )
  const faceTrackingEnabled = Boolean(
    proctoringCfg.face_tracking_enabled ?? proctoringEnabled,
  )
  const ambientSoundMonitoring = Boolean(
    proctoringCfg.ambient_sound_monitoring ?? proctoringEnabled,
  )
  const browserWindowTracking = Boolean(
    proctoringCfg.browser_window_tracking ?? proctoringEnabled,
  )
  const preventCopyPaste = Boolean(
    proctoringCfg.prevent_copy_paste ?? (proctoringEnabled ? true : false),
  )
  const alreadyStarted = Boolean(student.already_started ?? student.alreadyStarted)
  const canStart = Boolean(student.can_start ?? student.canStart)
  const resumeAttemptId = student.resume_attempt_id ?? student.resumeAttemptId ?? null
  const remainingRaw = student.remaining_attempts ?? student.remainingAttempts
  const remainingAttempts =
    remainingRaw == null || remainingRaw === '' ? null : Number(remainingRaw)

  const requireAnswerAll = Boolean(
    rules.require_answer_all ??
      rules.requireAnswerAll ??
      answerRules.require_answer_all ??
      answerRules.requireAnswerAll ??
      settingsConfig.require_all_answers ??
      (typeof answerRules.allow_skip_questions === 'boolean'
        ? !answerRules.allow_skip_questions
        : false),
  )

  const allowSkipQuestions = requireAnswerAll
    ? false
    : Boolean(
        rules.allow_skip_questions ??
          rules.allowSkipQuestions ??
          answerRules.allow_skip_questions ??
          settingsConfig.allow_skip_questions ??
          true,
      )

  const allowBackNavigation = Boolean(
    rules.allow_back_navigation ??
      rules.allowBackNavigation ??
      navigation.allow_back_navigation ??
      (typeof navigation.sequential_navigation === 'boolean'
        ? !navigation.sequential_navigation
        : true),
  )

  const rulesMaxAttempts = firstPositiveInt(rules.max_attempts, rules.maxAttempts)
  const maxAttempts = resolveMaxAttemptsFromSources({ rules, settingsConfig })

  const access = buildEntryAccessState({
    canStart,
    resumeAttemptId,
    alreadyStarted,
    remainingAttempts: Number.isFinite(remainingAttempts) ? remainingAttempts : null,
    maxAttempts,
    rulesMaxAttempts,
  })

  const subjectLabel = [subject.name, subject.code].filter(Boolean).join(' · ') || '—'

  return {
    examId: exam.id ?? null,
    title: exam.title || exam.name || '—',
    description: exam.description || '',
    subjectName: subject.name || '—',
    subjectLabel,
    teacherName: teacher.name || teacher.full_name || '—',
    studentName: data.student_name || data.user_name || student.name || student.full_name || '',
    instructions,
    rules: {
      allowBackNavigation,
      allowSkipQuestions,
      maxAttempts,
      proctoringEnabled,
      faceTrackingEnabled,
      ambientSoundMonitoring,
      browserWindowTracking,
      preventCopyPaste,
      requireAnswerAll,
      shuffleChoices: Boolean(
        rules.shuffle_choices ??
          rules.shuffleChoices ??
          settingsConfig.display_settings?.shuffle_choices,
      ),
      shuffleQuestions: Boolean(
        rules.shuffle_questions ??
          rules.shuffleQuestions ??
          settingsConfig.display_settings?.shuffle_questions,
      ),
    },
    proctoring: {
      enabled: proctoringEnabled,
      face_tracking_enabled: faceTrackingEnabled,
      ambient_sound_monitoring: ambientSoundMonitoring,
      browser_window_tracking: browserWindowTracking,
      prevent_copy_paste: preventCopyPaste,
      fullscreen_required: Boolean(proctoringCfg.fullscreen_required),
      tab_switch_limit: proctoringCfg.tab_switch_limit ?? undefined,
      severity_policy: proctoringCfg.severity_policy || undefined,
    },
    summary: {
      passingScore: summary.passing_score ?? summary.passingScore ?? null,
      questionsCount,
      totalScore: summary.total_score ?? summary.totalScore ?? null,
    },
    time: {
      availabilityMode:
        time.availability_mode ||
        time.availabilityMode ||
        exam.availability_time_mode ||
        exam.availability_mode ||
        data.availability_time_mode ||
        null,
      durationMinutes,
      endsAt: time.ends_at || time.endsAt || null,
      entryWindowMinutes: time.entry_window_minutes ?? time.entryWindowMinutes ?? null,
      startsAt: time.starts_at || time.startsAt || null,
    },
    student: {
      alreadyStarted,
      canStart,
      remainingAttempts: Number.isFinite(remainingAttempts) ? remainingAttempts : null,
      resumeAttemptId,
    },
    mayProceed: access.mayProceed,
    blockReason: access.blockReason,
  }
}
