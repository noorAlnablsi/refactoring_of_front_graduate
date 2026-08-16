import { getMyTests } from '../services/tests.service'
import { getWorkspaceTests } from '../services/workspaces.service'
import { isInstitutionWorkspace } from './workspaceContext'

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

/** Paginate GET /workspaces/tests (institution owner list). */
export async function fetchInstitutionWorkspaceTests({ search } = {}) {
  const trimmed = typeof search === 'string' ? search.trim() : ''
  return fetchAllTestPages((pageParams) =>
    getWorkspaceTests({
      ...pageParams,
      ...(trimmed ? { search: trimmed } : {}),
    }),
  )
}

/**
 * Same source as Exams list:
 * INSTITUTION → GET /workspaces/tests
 * SOLO → GET /tests/my
 */
export async function fetchTestsForActiveWorkspace({ search } = {}) {
  const trimmed = typeof search === 'string' ? search.trim() : ''

  if (isInstitutionWorkspace()) {
    return fetchInstitutionWorkspaceTests({ search: trimmed })
  }

  return fetchAllTestPages((pageParams) =>
    getMyTests({
      ...pageParams,
      ...(trimmed ? { search: trimmed } : {}),
    }),
  )
}

export function filterTestsBySubjectId(tests = [], subjectId) {
  const id = Number(subjectId)
  if (!Number.isFinite(id)) return []
  return tests.filter((test) => Number(test.subject_id) === id)
}
