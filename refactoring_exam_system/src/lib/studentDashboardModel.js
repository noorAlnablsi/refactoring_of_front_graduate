import i18n from '../i18n'
import { localizeDigits } from './localeNumber'

function tStudent(key, options = {}) {
  return i18n.t(key, { ns: 'student', ...options })
}

function getDateLocale() {
  return String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
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

function formatSubjectFallback() {
  return '—'
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
  const subjectName =
    (test.subject && typeof test.subject === 'object' ? test.subject.name : null) ||
    test.subject_name ||
    (typeof test.subject === 'string' ? test.subject : null) ||
    formatSubjectFallback(test.subject_id)

  return {
    id: test.test_id ?? test.id,
    subject: subjectName,
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

/**
 * Map GET /student/recent-exams → dashboard "آخر الاختبارات" table.
 * Ordered by submission date (newest first), any status (pending or graded).
 */
export function normalizeDashboardLatestResults(data, limit = 5) {
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []

  return items
    .filter((item) => item && item.attempt_id != null)
    .map((item) => {
      const dateRaw = item.submitted_at || item.graded_at || item.last_activity_at || null
      const dateParsed = dateRaw ? new Date(dateRaw) : null
      const sortTs =
        dateParsed && !Number.isNaN(dateParsed.getTime()) ? dateParsed.getTime() : 0
      return { item, sortTs, dateParsed }
    })
    .sort((a, b) => b.sortTs - a.sortTs || b.item.attempt_id - a.item.attempt_id)
    .slice(0, limit)
    .map(({ item, dateParsed }) => {
      const statusRaw = String(
        item.status || item.lifecycle_status || item.attempt_status || '',
      ).toUpperCase()
      const isGraded = statusRaw === 'GRADED'
      const scoreObj = item.score && typeof item.score === 'object' ? item.score : null
      const earned = scoreObj != null ? Number(scoreObj.earned) : null
      const maximum = scoreObj != null ? Number(scoreObj.maximum) : null
      const percentage = scoreObj != null ? Number(scoreObj.percentage) : null

      let score = '—'
      let scoreDetail = ''
      if (isGraded && Number.isFinite(percentage)) {
        score = localizeDigits(`${Math.round(percentage * 10) / 10}%`)
        if (Number.isFinite(earned) && Number.isFinite(maximum)) {
          scoreDetail = localizeDigits(`${earned}/${maximum}`)
        }
      } else if (isGraded && Number.isFinite(earned) && Number.isFinite(maximum)) {
        score = localizeDigits(`${earned}/${maximum}`)
      }

      const subject =
        item.subject && typeof item.subject === 'object'
          ? String(item.subject.name || '').trim()
          : String(item.subject || item.subject_name || '').trim()

      const test = item.test && typeof item.test === 'object' ? item.test : null
      const examTitle =
        String(test?.title || item.title || '').trim() || '—'

      const date =
        dateParsed && !Number.isNaN(dateParsed.getTime())
          ? dateParsed.toLocaleDateString(getDateLocale(), { dateStyle: 'medium' })
          : '—'

      return {
        id: item.attempt_id,
        exam: examTitle,
        subject: subject || '—',
        score,
        scoreDetail,
        date,
        status: isGraded ? 'approved' : 'pending',
      }
    })
}

export function buildDashboardStatsFromStudentTests(data, availableCount, upcomingCount) {
  const items = Array.isArray(data?.items) ? data.items : []
  const attemptRows = items.filter((item) => item && item.attempt_id != null)
  const graded = attemptRows.filter(
    (item) => String(item.lifecycle_status || '').toUpperCase() === 'GRADED',
  )

  const percentages = graded
    .map((item) => Number(item?.score?.percentage))
    .filter((n) => Number.isFinite(n))

  const averageScore =
    percentages.length === 0
      ? 0
      : Math.round((percentages.reduce((sum, n) => sum + n, 0) / percentages.length) * 10) / 10

  return {
    availableExams: availableCount,
    upcomingExams: upcomingCount,
    completedExams: graded.length,
    averageScore,
  }
}
