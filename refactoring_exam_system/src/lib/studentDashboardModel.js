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

  if (test.published_at || test.status === 'PUBLISHED') {
    return tStudent('availability.availableNow')
  }

  return '—'
}

function formatSubjectFallback(subjectId) {
  if (!subjectId) return '—'
  return tStudent('subjectFallback', { id: subjectId })
}

function pickStartDate(test) {
  const raw =
    test.start_time ||
    test.starts_at ||
    test.availability_window?.available_from ||
    test.available_from ||
    null
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function normalizeAvailableTestFromApi(test) {
  return {
    id: test.test_id ?? test.id,
    subject: test.subject_name || test.subject || formatSubjectFallback(test.subject_id),
    title: test.name || test.title || '—',
    teacher: test.teacher_name || test.teacher || '—',
    durationMinutes: test.duration_minutes ?? 0,
    questionsCount: test.questions_count ?? test.question_count ?? 0,
    availability: test.availability_label || test.availability_note || formatAvailabilityLabel(test),
    proctored: Boolean(test.proctored ?? test.is_proctored),
  }
}

export function normalizeAvailableTestsResponse(data) {
  const tests = data?.tests || data?.items || (Array.isArray(data) ? data : [])

  return {
    count: data?.count ?? tests.length,
    exams: tests.map(normalizeAvailableTestFromApi),
  }
}

const UPCOMING_TONES = ['teal', 'blue', 'purple']

/**
 * Normalizes GET /student/tests/upcoming (array or wrapped payload).
 */
export function normalizeUpcomingTestsResponse(data) {
  const tests = Array.isArray(data) ? data : data?.tests || data?.items || []
  return tests.map((exam, index) => normalizeUpcomingExam(exam, index))
}

export function normalizeUpcomingExam(exam, index = 0) {
  const startsAt = pickStartDate(exam)
  const dateLabel = startsAt
    ? startsAt.toLocaleDateString(getDateLocale(), { dateStyle: 'medium' })
    : exam.date_label || exam.dateLabel || exam.time_until_start_human || '—'
  const timeLabel = startsAt
    ? startsAt.toLocaleTimeString(getDateLocale(), { timeStyle: 'short' })
    : exam.time_label || exam.timeLabel || exam.availability_note || '—'

  return {
    id: exam.test_id ?? exam.id,
    subjectCode: exam.subject || exam.subject_code || exam.subjectCode || exam.subject_name || '—',
    title: exam.title || exam.name || '—',
    teacher: exam.teacher_name || exam.teacher || '—',
    dateLabel,
    timeLabel,
    tone: exam.tone || UPCOMING_TONES[index % UPCOMING_TONES.length],
    startsAt: startsAt ? startsAt.toISOString() : exam.starts_at || exam.start_time || null,
  }
}

export function buildCalendarEventsFromUpcoming(upcomingExams = []) {
  return upcomingExams
    .map((exam) => {
      if (!exam.startsAt) return null
      const parsed = new Date(exam.startsAt)
      if (Number.isNaN(parsed.getTime())) return null
      return {
        date: parsed.toISOString().slice(0, 10),
        examId: exam.id,
        title: exam.title,
      }
    })
    .filter(Boolean)
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
