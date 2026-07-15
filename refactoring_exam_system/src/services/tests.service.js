import api from '../lib/axios'

export async function createTest(payload) {
  const { data } = await api.post('/tests', payload)
  return data
}

export async function getMyTests() {
  const { data } = await api.get('/tests/my')
  return data
}

export async function getAvailableTests() {
  const { data } = await api.get('/tests/available')
  return data
}

export async function getTestById(testId) {
  const { data } = await api.get(`/tests/${testId}`)
  return data
}

export async function updateTest(testId, payload) {
  const { data } = await api.patch(`/tests/${testId}`, payload)
  return data
}

export async function deleteTest(testId) {
  const { data } = await api.delete(`/tests/${testId}`)
  return data
}

export async function archiveTest(testId) {
  const { data } = await api.post(`/tests/${testId}/archive`)
  return data
}

export async function closeTest(testId) {
  const { data } = await api.post(`/tests/${testId}/close`)
  return data
}

export async function publishTestNow(testId) {
  const { data } = await api.post(`/tests/${testId}/publish-now`)
  return data
}

export async function scheduleTestPublication(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/schedule-publication`, payload)
  return data
}

export async function assignStudentsToTest(testId, studentMembershipIds) {
  const { data } = await api.post(`/tests/${testId}/assign-students`, {
    student_membership_ids: studentMembershipIds,
  })
  return data
}

export async function getAssignedStudents(testId) {
  const { data } = await api.get(`/tests/${testId}/assigned-students`)
  return data
}

export async function removeAssignedStudent(testId, membershipId) {
  const { data } = await api.delete(`/tests/${testId}/assigned-students/${membershipId}`)
  return data
}

export async function addQuestionsFromBank(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/from-bank`, payload)
  return data
}

export async function importQuestionsFromCsv(testId, csvFile) {
  const formData = new FormData()
  formData.append('csv_file', csvFile)

  const { data } = await api.post(`/tests/${testId}/questions/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function addManualQuestions(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/manual`, payload)
  return data
}

export async function addRandomQuestionsFromBanks(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/random-from-banks`, payload)
  return data
}

export async function removeTestQuestion(testId, testQuestionId) {
  const { data } = await api.delete(`/tests/${testId}/questions/${testQuestionId}`)
  return data
}

export async function updateTestQuestion(testId, testQuestionId, payload) {
  const { data } = await api.patch(`/tests/${testId}/questions/${testQuestionId}`, payload)
  return data
}

export async function downloadExamQuestionsCsvTemplate() {
  const response = await api.get('/templates/exam-questions-csv', {
    responseType: 'blob',
    headers: { Accept: 'text/csv' },
  })

  const disposition = response.headers?.['content-disposition'] || ''
  const matched = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
  const filename = matched?.[1]
    ? matched[1].replace(/['"]/g, '')
    : 'exam_questions_template.csv'

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)

  return { filename }
}

export async function generateAiQuestions(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/ai-generate`, payload)
  return data
}

export async function getAiGenerationRequest(requestId) {
  const { data } = await api.get(`/ai-generation-requests/${requestId}`)
  return data
}

export async function updateAiGeneratedQuestion(questionId, payload) {
  const { data } = await api.put(`/ai-generated-questions/${questionId}`, payload)
  return data
}

export async function deleteAiGeneratedQuestion(questionId) {
  const { data } = await api.delete(`/ai-generated-questions/${questionId}`)
  return data
}

export async function importAiQuestions(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/import-ai`, payload)
  return data
}
