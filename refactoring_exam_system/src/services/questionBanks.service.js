import api from '../lib/axios'
import {
  filterActiveBanks,
  filterBanksByVisibility,
  mergeBanksById,
  QUESTION_BANK_TABS,
} from '../lib/questionBanks'

export async function fetchQuestionBanksForTab(tab) {
  if (tab === QUESTION_BANK_TABS.MY) {
    const data = await getMyQuestionBanks()
    return filterBanksByVisibility(filterActiveBanks(data.question_banks), 'PRIVATE')
  }

  if (tab === QUESTION_BANK_TABS.WORKSPACE) {
    const [myData, workspaceData] = await Promise.all([
      getMyQuestionBanks(),
      getWorkspaceQuestionBanks(),
    ])
    const myWorkspaceBanks = filterBanksByVisibility(
      filterActiveBanks(myData.question_banks),
      'WORKSPACE',
    )
    const sharedWorkspaceBanks = filterActiveBanks(workspaceData.question_banks)
    return mergeBanksById(myWorkspaceBanks, sharedWorkspaceBanks)
  }

  const data = await getCommunityQuestionBanks()
  return filterActiveBanks(data.question_banks)
}

export async function findQuestionBankById(bankId, sourceTab) {
  const matchId = (bank) => String(bank?.id) === String(bankId)
  const tabsToSearch = sourceTab
    ? [sourceTab, ...Object.values(QUESTION_BANK_TABS).filter((tab) => tab !== sourceTab)]
    : Object.values(QUESTION_BANK_TABS)

  for (const tab of tabsToSearch) {
    try {
      const banks = await fetchQuestionBanksForTab(tab)
      const found = banks.find(matchId)
      if (found) return found
    } catch {
      // Try the next source before giving up.
    }
  }

  return null
}

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

export async function loadQuestionBankQuestionsForView(bankId, { bank } = {}) {
  if (Array.isArray(bank?.questions) && bank.questions.length) {
    return { questions: bank.questions }
  }

  return getQuestionBankQuestions(bankId)
}

export async function getQuestionBankQuestions(bankId) {
  const { data } = await api.get(`/question-banks/${bankId}/questions`)
  return data
}

export async function createQuestionBankQuestions(bankId, questions) {
  const { data } = await api.post(`/question-banks/${bankId}/questions`, { questions })
  return data
}
