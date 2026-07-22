const IMPROVEMENT_THRESHOLD = 70
const MAX_IMPROVEMENT_SUBJECTS = 2

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Normalize GET /student/tests/results item (summary source).
 */
export function normalizeStudentResultItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const percentage = toNumber(raw.percentage)
  const score = toNumber(raw.score)
  const maxScore = toNumber(raw.max_score)

  return {
    attemptId: raw.attempt_id,
    testId: raw.test_id,
    title: String(raw.title || '').trim() || '—',
    subject: String(raw.subject || '').trim() || '—',
    teacherName: String(raw.teacher_name || '').trim() || '—',
    score,
    maxScore,
    percentage,
    status: String(raw.status || '').trim() || 'GRADED',
    gradedAt: raw.graded_at || null,
    submittedAt: null,
    reviewAllowed: false,
  }
}

export function normalizeStudentResultsResponse(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
  return list.map(normalizeStudentResultItem).filter(Boolean)
}

/**
 * Normalize GET /student/recent-exams item (paginated table source).
 */
export function normalizeRecentExamItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const scoreObj = raw.score && typeof raw.score === 'object' ? raw.score : null
  const percentage = scoreObj ? toNumber(scoreObj.percentage) : null
  const score = scoreObj ? toNumber(scoreObj.earned) : null
  const maxScore = scoreObj ? toNumber(scoreObj.maximum) : null

  const subject =
    typeof raw.subject === 'object' && raw.subject
      ? String(raw.subject.name || '').trim()
      : String(raw.subject || '').trim()

  const test = raw.test && typeof raw.test === 'object' ? raw.test : null

  return {
    attemptId: raw.attempt_id,
    testId: test?.id ?? null,
    title: String(test?.title || '').trim() || '—',
    subject: subject || '—',
    teacherName: String(raw.teacher_name || '').trim() || '—',
    score,
    maxScore,
    percentage,
    status: String(raw.status || '').trim() || '',
    gradedAt: null,
    submittedAt: raw.submitted_at || null,
    reviewAllowed: Boolean(raw.review_allowed),
  }
}

export function normalizeRecentExamsResponse(data) {
  const payload = data && typeof data === 'object' ? data : {}
  const items = Array.isArray(payload.items) ? payload.items : []
  const page = Math.max(1, Number(payload.page) || 1)
  const perPage = Math.max(1, Number(payload.per_page) || 10)
  const total = Math.max(0, Number(payload.total) || items.length)
  const totalPages = Math.max(1, Number(payload.pages) || Math.ceil(total / perPage) || 1)

  return {
    items: items.map(normalizeRecentExamItem).filter(Boolean),
    page,
    perPage,
    total,
    totalPages,
  }
}

/**
 * Presentation-only summary from graded results list.
 */
export function buildPerformanceSummary(results) {
  const withPercentage = results.filter((row) => row.percentage != null)

  const averageScore =
    withPercentage.length === 0
      ? null
      : Math.round(
          (withPercentage.reduce((sum, row) => sum + row.percentage, 0) / withPercentage.length) *
            10,
        ) / 10

  const highestScore =
    withPercentage.length === 0
      ? null
      : Math.max(...withPercentage.map((row) => row.percentage))

  const subjectBuckets = new Map()
  for (const row of withPercentage) {
    const key = row.subject
    if (!subjectBuckets.has(key)) subjectBuckets.set(key, [])
    subjectBuckets.get(key).push(row.percentage)
  }

  const subjectAverages = [...subjectBuckets.entries()].map(([name, values]) => ({
    name,
    average: values.reduce((sum, v) => sum + v, 0) / values.length,
  }))

  const subjectsNeedingImprovement = subjectAverages
    .filter((item) => item.average < IMPROVEMENT_THRESHOLD)
    .sort((a, b) => a.average - b.average)
    .slice(0, MAX_IMPROVEMENT_SUBJECTS)
    .map((item) => item.name)

  return {
    averageScore,
    highestScore,
    subjectsNeedingImprovement,
    totalCount: results.length,
  }
}

/** Sort within the current loaded page only (no server sort contract yet). */
export function sortStudentResults(results, sortBy = 'date') {
  const copy = [...results]
  if (sortBy === 'percentage') {
    return copy.sort((a, b) => (b.percentage ?? -1) - (a.percentage ?? -1))
  }
  if (sortBy === 'title') {
    return copy.sort((a, b) => a.title.localeCompare(b.title, 'ar'))
  }
  return copy.sort((a, b) => {
    const ta = new Date(a.gradedAt || a.submittedAt || 0).getTime()
    const tb = new Date(b.gradedAt || b.submittedAt || 0).getTime()
    return tb - ta
  })
}

export function getPercentageBarTone(percentage) {
  if (percentage == null) return 'muted'
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'info'
  return 'danger'
}

export function getResultDisplayDate(row) {
  return row?.gradedAt || row?.submittedAt || null
}
