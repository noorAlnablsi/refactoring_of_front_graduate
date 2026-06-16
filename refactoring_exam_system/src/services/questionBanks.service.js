import api from '../lib/axios'

export async function getMyQuestionBanks() {
  const { data } = await api.get('/question-banks/my')
  return data
}

export async function getWorkspaceQuestionBanks({ page = 1, perPage = 50 } = {}) {
  const { data } = await api.get('/question-banks/workspace', {
    params: { page, per_page: perPage },
  })
  return data
}

export async function getCommunityQuestionBanks({ page = 1, perPage = 50 } = {}) {
  const { data } = await api.get('/question-banks/community', {
    params: { page, per_page: perPage },
  })
  return data
}

export async function createQuestionBank(payload) {
  const { data } = await api.post('/question-banks', payload)
  return data
}

export async function updateQuestionBank(bankId, payload) {
  const { data } = await api.patch(`/question-banks/${bankId}`, payload)
  return data
}

export async function archiveQuestionBank(bankId) {
  const { data } = await api.delete(`/question-banks/${bankId}`)
  return data
}

export async function getQuestionBankQuestions(bankId) {
  const { data } = await api.get(`/question-banks/${bankId}/questions`)
  return data
}

export async function createQuestionBankQuestions(bankId, questions) {
  const { data } = await api.post(`/question-banks/${bankId}/questions`, { questions })
  return data
}
