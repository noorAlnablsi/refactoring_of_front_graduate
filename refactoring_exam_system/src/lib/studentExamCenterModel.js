import i18n from '../i18n'

function tStudent(key, options = {}) {
  return i18n.t(key, { ns: 'student', ...options })
}

function getDateLocale() {
  return String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function pickSubjectName(raw) {
  if (raw && typeof raw.subject === 'object' && raw.subject) {
    return String(raw.subject.name || '').trim() || null
  }
  return (
    String(raw?.subject_name || raw?.subject || '').trim() ||
    null
  )
}

function parseDate(rawDate) {
  if (!rawDate) return null
  const parsed = new Date(rawDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}


function resolveClosingDate(raw) {
  const mode = String(
    raw?.availability_time_mode || raw?.availability_mode || '',
  ).toUpperCase()

  const closedAt = parseDate(
    raw?.closed_at || raw?.end_time || raw?.ends_at || raw?.available_until || raw?.closes_at,
  )

  if (closedAt) return closedAt

  const startsAt = parseDate(raw?.starts_at || raw?.start_time)
  const durationMinutes = toNumber(raw?.duration_minutes)

  const shouldComputeScheduled =
    mode === 'SCHEDULED' || (mode !== 'FLEXIBLE' && startsAt && durationMinutes != null && durationMinutes > 0)

  if (shouldComputeScheduled && startsAt && durationMinutes != null && durationMinutes > 0) {
    return new Date(startsAt.getTime() + durationMinutes * 60 * 1000)
  }

  return null
}

export function formatExamCenterClosingDate(date) {
  if (!date || Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(getDateLocale(), { day: 'numeric', month: 'long' })
}

export function formatExamCenterTimeRemaining({ seconds, endDate }) {
  let remaining = toNumber(seconds)
  if (remaining == null && endDate) {
    remaining = Math.floor((endDate.getTime() - Date.now()) / 1000)
  }
  if (remaining == null) {
    return { label: null, urgent: false }
  }
  if (remaining < 0) {
    return { label: tStudent('examCenter.remaining.ended'), urgent: true }
  }

  if (remaining < 24 * 3600) {
    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    return {
      label: tStudent('examCenter.remaining.hoursMinutes', { hours, minutes }),
      urgent: true,
    }
  }

  const days = Math.max(1, Math.ceil(remaining / (24 * 3600)))
  return {
    label: tStudent('examCenter.remaining.days', { count: days }),
    urgent: false,
  }
}


export function enrichAvailableExamForCenter(exam, raw = null) {
  const source = raw || {}
  const endDate = resolveClosingDate(source)
  const remaining = formatExamCenterTimeRemaining({
    seconds: source.time_until_end_seconds ?? source.time_remaining_seconds,
    endDate,
  })

  return {
    ...exam,
    subject: exam.subject,
    closingDateLabel:
      formatExamCenterClosingDate(endDate) ||
      (source.time_until_end_human ? String(source.time_until_end_human) : null),
    remainingLabel: remaining.label,
    remainingUrgent: remaining.urgent,
  }
}

export function normalizeExamCenterAvailableList(data) {
  const tests = data?.tests || data?.items || (Array.isArray(data) ? data : [])
  return tests.map((raw) => {
    const base = {
      id: raw.test_id ?? raw.id,
      subject:
        pickSubjectName(raw) ||
        (raw.subject_id ? tStudent('subjectFallback', { id: raw.subject_id }) : '—'),
      title: raw.name || raw.title || '—',
      teacher: raw.teacher_name || raw.teacher || '—',
      durationMinutes: raw.duration_minutes ?? 0,
      questionsCount: raw.questions_count ?? raw.question_count ?? 0,
      availability: raw.availability_label || raw.availability_note || null,
      proctored: Boolean(raw.proctored ?? raw.is_proctored),
    }
    return enrichAvailableExamForCenter(base, raw)
  })
}


export function normalizeExamCenterRecentItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.attempt_id == null && !raw.attempt_status && !raw.lifecycle_status) return null

  const lifecycle = String(raw.lifecycle_status || raw.attempt_status || '').toUpperCase()
  if (!lifecycle || lifecycle === 'AVAILABLE' || lifecycle === 'UPCOMING') {
    if (raw.attempt_id == null) return null
  }

  const scoreObj = raw.score && typeof raw.score === 'object' ? raw.score : null
  const earned = scoreObj ? toNumber(scoreObj.earned) : null
  const maximum = scoreObj ? toNumber(scoreObj.maximum) : null
  const percentage = scoreObj ? toNumber(scoreObj.percentage) : null
  const reviewAllowed = Boolean(raw.review_allowed)
  const isPending = lifecycle === 'PENDING_GRADING' || lifecycle === 'SUBMITTED'
  const isGraded = lifecycle === 'GRADED'

  let badgeKey = 'submitted'
  if (isPending) badgeKey = 'pendingGrading'
  else if (isGraded && reviewAllowed) badgeKey = 'gradedReviewOpen'
  else if (isGraded) badgeKey = 'gradedReviewLocked'

  let actionKey = 'reviewUnavailable'
  if (isGraded && reviewAllowed) actionKey = 'viewResultAndReview'
  else if (isGraded) actionKey = 'viewResult'

  let scoreDisplay = '—'
  if (isPending) {
    scoreDisplay =
      maximum != null
        ? tStudent('examCenter.score.placeholderOverMax', { max: maximum })
        : tStudent('examCenter.score.placeholder')
  } else if (isGraded && reviewAllowed && percentage != null) {
    scoreDisplay = tStudent('examCenter.score.percent', {
      value: Math.round(percentage * 10) / 10,
    })
  } else if (earned != null && maximum != null) {
    scoreDisplay = tStudent('examCenter.score.fraction', { earned, max: maximum })
  } else if (percentage != null) {
    scoreDisplay = tStudent('examCenter.score.percent', {
      value: Math.round(percentage * 10) / 10,
    })
  }

  return {
    key: `${raw.attempt_id ?? 'x'}-${raw.test_id ?? 't'}`,
    attemptId: raw.attempt_id,
    testId: raw.test_id,
    title: String(raw.title || '').trim() || '—',
    teacher: String(raw.teacher_name || '').trim() || '—',
    subject: pickSubjectName(raw) || '—',
    lifecycle,
    reviewAllowed,
    isPending,
    isGraded,
    badgeKey,
    actionKey,
    actionEnabled: isGraded,
    scoreDisplay,
    durationMinutes: raw.duration_minutes ?? null,
    questionsCount: raw.questions_count ?? raw.question_count ?? null,
  }
}

export function normalizeExamCenterRecentResponse(data) {
  const payload = data && typeof data === 'object' ? data : {}
  const items = Array.isArray(payload.items) ? payload.items : Array.isArray(data) ? data : []
  const recent = items.map(normalizeExamCenterRecentItem).filter(Boolean)

  return {
    items: recent,
    page: Math.max(1, Number(payload.page) || 1),
    perPage: Math.max(1, Number(payload.per_page) || 20),
    total: Math.max(0, Number(payload.total) || recent.length),
    totalPages: Math.max(1, Number(payload.pages) || 1),
  }
}
