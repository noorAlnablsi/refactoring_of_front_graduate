import { getMyTests } from '../services/tests.service'
import { getWorkspaceTests } from '../services/workspaces.service'
import { canListInstitutionWorkspaceTests } from './workspaceContext'

function normalizeTestsResponse(data) {
  return data?.tests || data?.items || []
}

async function fetchAllTestPages(fetchPage) {
  const perPage = 50
  let page = 1
  let pages = 1
  const tests = []

  do {
    const data = await fetchPage({ page, per_page: perPage })
    tests.push(...normalizeTestsResponse(data))
    pages = Math.max(Number(data.pages) || 1, 1)
    if (!data.pages && normalizeTestsResponse(data).length < perPage) break
    page += 1
  } while (page <= pages)

  return tests
}

function buildListParams({ search, status, include_archived } = {}) {
  const trimmed = typeof search === 'string' ? search.trim() : ''
  const params = {
    ...(trimmed ? { search: trimmed } : {}),
  }
  if (status) params.status = status
  if (include_archived != null) params.include_archived = include_archived
  return params
}

export async function fetchInstitutionWorkspaceTests({ search, status, include_archived } = {}) {
  const listParams = buildListParams({ search, status, include_archived })
  return fetchAllTestPages((pageParams) => getWorkspaceTests({ ...pageParams, ...listParams }))
}

export async function fetchTestsForActiveWorkspace({ search, status, include_archived } = {}) {
  const listParams = buildListParams({ search, status, include_archived })

  if (canListInstitutionWorkspaceTests()) {
    return fetchInstitutionWorkspaceTests(listParams)
  }

  return fetchAllTestPages((pageParams) => getMyTests({ ...pageParams, ...listParams }))
}

export function filterTestsBySubjectId(tests = [], subjectId) {
  const id = Number(subjectId)
  if (!Number.isFinite(id)) return []
  return tests.filter((test) => Number(test.subject_id) === id)
}
