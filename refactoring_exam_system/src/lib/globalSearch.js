import { ROUTES } from '../constants/routes'

export const GLOBAL_SEARCH_SECTIONS = [
  { key: 'subjects', type: 'subject' },
  { key: 'tests', type: 'test' },
  { key: 'surveys', type: 'survey' },
  { key: 'question_banks', type: 'question_bank' },
  { key: 'groups', type: 'group' },
  { key: 'students', type: 'student' },
  { key: 'teachers', type: 'teacher' },
  { key: 'results', type: 'result' },
]

export function flattenGlobalSearchResults(payload) {
  const grouped = payload?.results || {}
  return GLOBAL_SEARCH_SECTIONS.map((section) => {
    const items = Array.isArray(grouped[section.key]) ? grouped[section.key] : []
    return {
      key: section.key,
      items,
    }
  }).filter((section) => section.items.length > 0)
}

export function countGlobalSearchHits(payload) {
  return flattenGlobalSearchResults(payload).reduce((sum, section) => sum + section.items.length, 0)
}

/**
 * Map backend route descriptors to frontend paths.
 * Unknown routes return null (hit shown but not navigable).
 */
export function resolveGlobalSearchPath(hit) {
  const name = hit?.route?.name
  const params = hit?.route?.params || {}

  switch (name) {
    case 'subject.detail': {
      const id = params.subject_id ?? hit.id
      return id != null ? `${ROUTES.SUBJECTS}/${id}` : null
    }
    case 'test.detail': {
      const id = params.test_id ?? hit.id
      return id != null ? ROUTES.EXAM_EDIT.replace(':id', String(id)) : null
    }
    case 'survey.manage': {
      const id = params.survey_id ?? params.test_id ?? hit.id
      return id != null ? ROUTES.SURVEY_EDIT.replace(':id', String(id)) : null
    }
    case 'survey.detail':
    case 'survey.community': {
      const id = params.survey_id ?? hit.id
      return id != null ? ROUTES.SURVEY_RESPOND.replace(':id', String(id)) : null
    }
    case 'question_bank.detail': {
      const id = params.question_bank_id ?? hit.id
      return id != null ? `${ROUTES.QUESTION_BANKS}/${id}/editor` : null
    }
    case 'group.detail': {
      const id = params.group_id ?? hit.id
      return id != null ? ROUTES.GROUP_DETAILS.replace(':groupId', String(id)) : null
    }
    case 'workspace.student':
      return ROUTES.MEMBERS_STUDENTS
    case 'workspace.teacher':
      return ROUTES.MEMBERS_TEACHERS
    case 'student.test.entry': {
      const id = params.test_id ?? hit.id
      return id != null ? ROUTES.STUDENT_EXAM_ENTRY.replace(':testId', String(id)) : null
    }
    case 'student.test.result':
      return ROUTES.STUDENT_RESULTS
    default:
      return null
  }
}
