import api from '../lib/axios'

export async function getUpcomingStudentTests() {
  const { data } = await api.get('/student/tests/upcoming')
  return data
}

export async function getStudentTestEntry(testId) {
  const { data } = await api.get(`/student/tests/${testId}/entry`)
  return data
}

export async function getStudentTests({ page = 1, perPage = 20 } = {}) {
  const { data } = await api.get('/student/tests', {
    params: { page, per_page: perPage },
  })
  return data
}

export async function getStudentExams({ status } = {}) {
  const { data } = await api.get('/student/exams', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function getStudentTestResults() {
  const { data } = await api.get('/student/tests/results')
  return data
}

export async function getStudentRecentExams({ page = 1, perPage = 10 } = {}) {
  const { data } = await api.get('/student/recent-exams', {
    params: { page, per_page: perPage },
  })
  return data
}

export async function getStudentResults() {
  return getStudentTestResults()
}
