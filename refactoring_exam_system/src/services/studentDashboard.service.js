import api from '../lib/axios'

/**
 * Student home dashboard — aggregated payload for the main screen.
 *
 * Backend contract (proposed):
 * GET /student/dashboard
 * Headers: Authorization, X-Workspace-Id
 */
export async function getStudentDashboard() {
  const { data } = await api.get('/student/dashboard')
  return data
}

/**
 * Full exams list (صفحة الاختبارات — عرض الكل).
 * GET /student/exams?status=available|upcoming|completed
 */
export async function getStudentExams({ status } = {}) {
  const { data } = await api.get('/student/exams', {
    params: status ? { status } : undefined,
  })
  return data
}

/**
 * Full results list (صفحة النتائج).
 * GET /student/results
 */
export async function getStudentResults() {
  const { data } = await api.get('/student/results')
  return data
}

/**
 * Start exam attempt from dashboard card.
 * POST /student/exams/:examId/start
 */
export async function startStudentExam(examId) {
  const { data } = await api.post(`/student/exams/${examId}/start`)
  return data
}
