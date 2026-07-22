import api from '../lib/axios'

/**
 * GET /student/tests/upcoming
 */
export async function getUpcomingStudentTests() {
  const { data } = await api.get('/student/tests/upcoming')
  return data
}

/**
 * GET /student/tests/{testId}/entry — pre-exam preparation payload
 */
export async function getStudentTestEntry(testId) {
  const { data } = await api.get(`/student/tests/${testId}/entry`)
  return data
}

/**
 * Full exams list (صفحة الاختبارات — عرض الكل) — optional until backend ships it.
 * GET /student/exams?status=available|upcoming|completed
 */
export async function getStudentExams({ status } = {}) {
  const { data } = await api.get('/student/exams', {
    params: status ? { status } : undefined,
  })
  return data
}

/**
 * Full graded results list for performance dashboard.
 * GET /student/tests/results
 */
export async function getStudentTestResults() {
  const { data } = await api.get('/student/tests/results')
  return data
}

/**
 * Paginated recent exam attempts (graded + pending).
 * GET /student/recent-exams?page=&per_page=
 */
export async function getStudentRecentExams({ page = 1, perPage = 10 } = {}) {
  const { data } = await api.get('/student/recent-exams', {
    params: { page, per_page: perPage },
  })
  return data
}

/**
 * @deprecated Prefer getStudentTestResults() — kept for callers during migration.
 * GET /student/tests/results
 */
export async function getStudentResults() {
  return getStudentTestResults()
}
