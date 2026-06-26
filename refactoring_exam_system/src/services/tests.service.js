import api from '../lib/axios'

export async function createTest(payload) {
  const { data } = await api.post('/tests', payload)
  return data
}

export async function getMyTests() {
  const { data } = await api.get('/tests/my')
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

export async function addQuestionsFromBank(testId, payload) {
  const { data } = await api.post(`/tests/${testId}/questions/from-bank`, payload)
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
