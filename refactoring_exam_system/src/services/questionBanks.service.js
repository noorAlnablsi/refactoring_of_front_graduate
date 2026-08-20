import api from '../lib/axios'
import {
  filterActiveBanks,
  filterBanksByVisibility,
  mergeBanksById,
  QUESTION_BANK_TABS,
} from '../lib/questionBanks'

function buildSearchParams({ page, perPage, search } = {}) {
  const params = {}
  if (page != null) params.page = page
  if (perPage != null) params.per_page = perPage
  if (search != null && String(search).trim()) {
    params.search = String(search).trim()
  }
  return params
}

async function fetchAllBankPages(fetchPage) {
  const perPage = 50
  let page = 1
  let pages = 1
  const banks = []

  do {
    const data = await fetchPage({ page, perPage })
    const chunk = data.question_banks || []
    banks.push(...chunk)
    pages = Math.max(Number(data.pages) || 1, 1)
    if (!data.pages && chunk.length < perPage) break
    page += 1
  } while (page <= pages)

  return banks
}

export async function fetchQuestionBanksForTab(tab, { search } = {}) {
  const trimmed = typeof search === 'string' ? search.trim() : ''

  if (tab === QUESTION_BANK_TABS.MY) {
    const data = await getMyQuestionBanks({ search: trimmed || undefined })
    return filterBanksByVisibility(filterActiveBanks(data.question_banks), 'PRIVATE')
  }

  if (tab === QUESTION_BANK_TABS.WORKSPACE) {
    const [myData, workspaceBanks] = await Promise.all([
      getMyQuestionBanks({ search: trimmed || undefined }),
      fetchAllBankPages(({ page, perPage }) =>
        getWorkspaceQuestionBanks({ page, perPage, search: trimmed || undefined }),
      ),
    ])
    const myWorkspaceBanks = filterBanksByVisibility(
      filterActiveBanks(myData.question_banks),
      'WORKSPACE',
    )
    const sharedWorkspaceBanks = filterActiveBanks(workspaceBanks)
    return mergeBanksById(myWorkspaceBanks, sharedWorkspaceBanks)
  }

  const communityBanks = await fetchAllBankPages(({ page, perPage }) =>
    getCommunityQuestionBanks({ page, perPage, search: trimmed || undefined }),
  )
  return filterActiveBanks(communityBanks)
}

export async function getQuestionBankById(bankId) {
  const { data } = await api.get(`/question-banks/${bankId}`)
  return data
}

export async function findQuestionBankById(bankId, sourceTab) {
  const matchId = (bank) => String(bank?.id) === String(bankId)

  if (sourceTab === QUESTION_BANK_TABS.COMMUNITY) {
    try {
      const data = await getQuestionBankById(bankId)
      if (data?.question_bank && matchId(data.question_bank)) {
        return data.question_bank
      }
    } catch {
      // Fall back to community list lookup.
    }
  }

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

export async function getMyQuestionBanks({ search } = {}) {
  const { data } = await api.get('/question-banks/my', {
    params: buildSearchParams({ search }),
  })
  return data
}

export async function getWorkspaceQuestionBanks({ page = 1, perPage = 50, search } = {}) {
  const { data } = await api.get('/question-banks/workspace', {
    params: buildSearchParams({ page, perPage, search }),
  })
  return data
}

export async function getCommunityQuestionBanks({ page = 1, perPage = 50, search } = {}) {
  const { data } = await api.get('/question-banks/community', {
    params: buildSearchParams({ page, perPage, search }),
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

export async function getQuestionBankQuestions(bankId, { search } = {}) {
  const params = {}
  if (search != null && String(search).trim()) params.search = String(search).trim()
  const { data } = await api.get(`/question-banks/${bankId}/questions`, { params })
  return data
}

export async function createQuestionBankQuestions(bankId, questions) {
  const { data } = await api.post(`/question-banks/${bankId}/questions`, { questions })
  return data
}

export async function updateQuestionInBank(bankId, questionId, payload) {
  const { data } = await api.patch(`/question-banks/${bankId}/questions/${questionId}`, payload)
  return data
}

export async function deleteQuestionInBank(bankId, questionId) {
  const { data } = await api.delete(`/question-banks/${bankId}/questions/${questionId}`)
  return data
}

function filenameFromDisposition(disposition, fallback) {
  const matched = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition || '')
  if (!matched?.[1]) return fallback
  return matched[1].replace(/['"]/g, '')
}

/** GET /question-banks/{bank_id}/questions/import-template */
export async function downloadQuestionBankCsvTemplate(bankId) {
  const response = await api.get(`/question-banks/${bankId}/questions/import-template`, {
    responseType: 'blob',
    headers: { Accept: 'text/csv' },
  })

  const filename = filenameFromDisposition(
    response.headers?.['content-disposition'],
    'question_bank_questions_import_template.csv',
  )

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/** POST /question-banks/{bank_id}/questions/import-csv — atomic import. */
export async function importQuestionBankQuestionsFromCsv(bankId, csvFile) {
  const formData = new FormData()
  formData.append('csv_file', csvFile)

  const { data } = await api.post(`/question-banks/${bankId}/questions/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
