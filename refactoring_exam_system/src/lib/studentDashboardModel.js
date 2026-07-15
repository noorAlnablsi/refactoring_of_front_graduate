import i18n from '../i18n'

function tStudent(key, options = {}) {
  return i18n.t(key, { ns: 'student', ...options })
}

function getDateLocale() {
  return i18n.language === 'ar' ? 'ar-EG' : 'en-US'
}

function formatAvailabilityLabel(test) {
  if (test.starts_at) {
    const startsAt = new Date(test.starts_at)
    if (!Number.isNaN(startsAt.getTime())) {
      return tStudent('availability.startsAt', {
        datetime: startsAt.toLocaleString(getDateLocale(), {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      })
    }
  }

  if (test.published_at) {
    return tStudent('availability.availableNow')
  }

  return '—'
}

function formatSubjectFallback(subjectId) {
  if (!subjectId) return '—'
  return tStudent('subjectFallback', { id: subjectId })
}

export function normalizeAvailableTestFromApi(test) {
  return {
    id: test.test_id ?? test.id,
    subject: test.subject_name || formatSubjectFallback(test.subject_id),
    title: test.name || test.title || '—',
    teacher: test.teacher_name || test.teacher || '—',
    durationMinutes: test.duration_minutes ?? 0,
    questionsCount: test.questions_count ?? test.question_count ?? 0,
    availability: test.availability_label || formatAvailabilityLabel(test),
    proctored: Boolean(test.proctored ?? test.is_proctored),
  }
}

export function normalizeAvailableTestsResponse(data) {
  const tests = data?.tests || data?.items || []

  return {
    count: data?.count ?? tests.length,
    exams: tests.map(normalizeAvailableTestFromApi),
  }
}

/**
 * Normalizes GET /student/dashboard response for UI components.
 */
export function normalizeStudentDashboard(data) {
  const payload = data?.dashboard || data || {}

  return {
    stats: {
      availableExams: payload.stats?.available_exams ?? payload.stats?.availableExams ?? 0,
      upcomingExams: payload.stats?.upcoming_exams ?? payload.stats?.upcomingExams ?? 0,
      completedExams: payload.stats?.completed_exams ?? payload.stats?.completedExams ?? 0,
      averageScore: payload.stats?.average_score ?? payload.stats?.averageScore ?? 0,
    },
    availableExams: (payload.available_exams || payload.availableExams || []).map(normalizeAvailableExam),
    upcomingExams: (payload.upcoming_exams || payload.upcomingExams || []).map(normalizeUpcomingExam),
    latestResults: (payload.latest_results || payload.latestResults || []).map(normalizeLatestResult),
    calendarEvents: (payload.calendar_events || payload.calendarEvents || []).map(normalizeCalendarEvent),
  }
}

function normalizeAvailableExam(exam) {
  if (exam.test_id != null || (exam.name && exam.subject_id != null)) {
    return normalizeAvailableTestFromApi(exam)
  }

  return {
    id: exam.id,
    subject: exam.subject_name || exam.subject || '—',
    title: exam.title || exam.name || '—',
    teacher: exam.teacher_name || exam.teacher || '—',
    durationMinutes: exam.duration_minutes ?? exam.durationMinutes ?? 0,
    questionsCount: exam.questions_count ?? exam.questionsCount ?? 0,
    availability: exam.availability_label || exam.availability || '—',
    proctored: Boolean(exam.proctored ?? exam.is_proctored),
  }
}

function normalizeUpcomingExam(exam) {
  return {
    id: exam.id,
    subjectCode: exam.subject_code || exam.subjectCode || exam.subject_name || '—',
    title: exam.title || exam.name || '—',
    teacher: exam.teacher_name || exam.teacher || '—',
    dateLabel: exam.date_label || exam.dateLabel || '—',
    timeLabel: exam.time_label || exam.timeLabel || '—',
    tone: exam.tone || 'teal',
    startsAt: exam.starts_at || exam.startsAt || null,
  }
}

function normalizeLatestResult(row) {
  const status = row.status === 'pending' || row.status === 'UNDER_REVIEW' ? 'pending' : 'approved'

  return {
    id: row.id,
    exam: row.exam_name || row.exam || '—',
    subject: row.subject_name || row.subject || '—',
    score: row.score_label || row.score || '—',
    scoreDetail: row.score_detail || row.scoreDetail || null,
    date: row.date_label || row.date || '—',
    status,
  }
}

function normalizeCalendarEvent(event) {
  return {
    date: event.date,
    examId: event.exam_id ?? event.examId ?? null,
    title: event.title || null,
  }
}

export function getCalendarEventDays(events = [], year, month) {
  return events
    .filter((event) => {
      if (!event.date) return false
      const parsed = new Date(event.date)
      return parsed.getFullYear() === year && parsed.getMonth() === month
    })
    .map((event) => new Date(event.date).getDate())
}
