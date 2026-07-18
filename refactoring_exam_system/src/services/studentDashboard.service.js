import api from '../lib/axios'

/**
 * GET /student/tests/upcoming
 */
export async function getUpcomingStudentTests() {
  const { data } = await api.get('/student/tests/upcoming')
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
 * Full results list (صفحة النتائج) — optional until backend ships it.
 * GET /student/results
 */
export async function getStudentResults() {
  const { data } = await api.get('/student/results')
  return data
}
