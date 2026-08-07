import { getMyTests } from '../services/tests.service'
import { getWorkspaceTests } from '../services/workspaces.service'
import { isInstitutionWorkspace } from './workspaceContext'

function normalizeTestsResponse(data) {
  return data?.tests || data?.items || []
}

/** Paginate GET /workspaces/tests (institution owner list). */
export async function fetchInstitutionWorkspaceTests() {
  const perPage = 50
  let page = 1
  let pages = 1
  const tests = []

  do {
    const data = await getWorkspaceTests({ page, per_page: perPage })
    tests.push(...normalizeTestsResponse(data))
    pages = Number(data.pages) || 1
    page += 1
  } while (page <= pages)

  return tests
}

/**
 * Same source as Exams list:
 * INSTITUTION → GET /workspaces/tests
 * SOLO → GET /tests/my
 */
export async function fetchTestsForActiveWorkspace() {
  if (isInstitutionWorkspace()) {
    return fetchInstitutionWorkspaceTests()
  }

  const data = await getMyTests()
  return normalizeTestsResponse(data)
}

export function filterTestsBySubjectId(tests = [], subjectId) {
  const id = Number(subjectId)
  if (!Number.isFinite(id)) return []
  return tests.filter((test) => Number(test.subject_id) === id)
}
