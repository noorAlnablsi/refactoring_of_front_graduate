/**
 * Normalize GET /student/tests/{id}/entry for ExamEntryPage.
 */
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
  const proctoringEnabled = Boolean(
    rules.proctoring_enabled ??
      rules.proctoringEnabled ??
      settingsConfig.proctoring?.enabled,
  )
  const alreadyStarted = Boolean(student.already_started ?? student.alreadyStarted)
  const canStart = Boolean(student.can_start ?? student.canStart)
  const resumeAttemptId = student.resume_attempt_id ?? student.resumeAttemptId ?? null
  const remainingAttempts = student.remaining_attempts ?? student.remainingAttempts ?? null

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

  const maxAttempts =
    rules.max_attempts ??
    rules.maxAttempts ??
    attemptSettings.max_attempts ??
    settingsConfig.max_attempts ??
    null

  const canResume = Boolean(resumeAttemptId)
  /** Fresh start OR resume in-progress — never "alreadyStarted" alone (blocks false re-entry). */
  const mayProceed = canResume || canStart

  let blockReason = null
  if (!mayProceed) {
    if (
      remainingAttempts === 0 ||
      (Number(maxAttempts) === 1 && alreadyStarted && !canResume)
    ) {
      blockReason = 'max_attempts'
    } else if (alreadyStarted && !canResume) {
      blockReason = 'already_completed'
    } else {
      blockReason = 'unavailable'
    }
  }

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
    summary: {
      passingScore: summary.passing_score ?? summary.passingScore ?? null,
      questionsCount,
      totalScore: summary.total_score ?? summary.totalScore ?? null,
    },
    time: {
      availabilityMode: time.availability_mode || time.availabilityMode || null,
      durationMinutes,
      endsAt: time.ends_at || time.endsAt || null,
      entryWindowMinutes: time.entry_window_minutes ?? time.entryWindowMinutes ?? null,
      startsAt: time.starts_at || time.startsAt || null,
    },
    student: {
      alreadyStarted,
      canStart,
      remainingAttempts,
      resumeAttemptId,
    },
    mayProceed,
    blockReason,
  }
}
