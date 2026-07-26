import { getSubjectTeachers, getSubjects } from '../services/subjects.service'
import { getTeacherMembershipSubjects } from '../services/memberships.service'
import { getActiveMembership } from './workspaceContext'

/** Normalize one assigned-subject row from various API shapes. */
export function normalizeAssignedSubject(raw) {
  if (!raw || typeof raw !== 'object') return null
  const nested = raw.subject && typeof raw.subject === 'object' ? raw.subject : null
  const id = raw.id ?? raw.subject_id ?? nested?.id
  if (id == null || id === '') return null
  const archived = Boolean(raw.is_archived ?? nested?.is_archived)
  if (archived) return null
  return {
    id: Number(id),
    name: String(raw.name || raw.title || nested?.name || nested?.title || '').trim() || `#${id}`,
    is_archived: false,
  }
}

export function pickAssignedSubjectsFromPayload(payload) {
  if (!payload) return []
  const list = Array.isArray(payload)
    ? payload
    : payload.assigned_subjects || payload.subjects || payload.items || payload.data || []
  if (!Array.isArray(list)) return []
  return list.map(normalizeAssignedSubject).filter(Boolean)
}

/**
 * Resolve subjects the teacher is assigned to (with id + name).
 * 1) GET /teacher-memberships/{id}/subjects
 * 2) GET /subjects + filter (or trust scoped list for self-teacher)
 */
export async function resolveTeacherAssignedSubjects(membershipId) {
  if (!membershipId) return []

  try {
    const data = await getTeacherMembershipSubjects(membershipId)
    const fromMembership = pickAssignedSubjectsFromPayload(data)
    if (fromMembership.length) return fromMembership
  } catch {
    // continue to fallbacks
  }

  try {
    const subjectsRes = await getSubjects()
    const subjects = pickAssignedSubjectsFromPayload(subjectsRes)
    if (!subjects.length) return []

    const membership = getActiveMembership()
    const isSelfTeacher =
      String(membership?.role || '').toUpperCase() === 'TEACHER' &&
      Number(membership?.membership_id) === Number(membershipId)

    // Institution teachers only see assigned subjects on GET /subjects.
    if (isSelfTeacher) return subjects

    const results = await Promise.all(
      subjects.map(async (subject) => {
        try {
          const data = await getSubjectTeachers(subject.id)
          const assigned = (data.teachers || []).some(
            (teacher) => Number(teacher.membership_id) === Number(membershipId),
          )
          return assigned ? subject : null
        } catch {
          return null
        }
      }),
    )
    return results.filter(Boolean)
  } catch {
    return []
  }
}

export async function resolveTeacherAssignedSubjectIds(membershipId) {
  const subjects = await resolveTeacherAssignedSubjects(membershipId)
  return subjects.map((subject) => subject.id)
}
