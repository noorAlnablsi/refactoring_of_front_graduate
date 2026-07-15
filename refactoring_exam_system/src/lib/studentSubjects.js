import { getSubjectStudents, getSubjects } from '../services/subjects.service'

function getSubjectStudentMembershipId(student) {
  const rawId = student?.membership_id ?? student?.workspace_membership_id ?? null

  if (rawId == null || rawId === '') return null

  const membershipId = Number(rawId)
  return Number.isFinite(membershipId) ? membershipId : null
}

function normalizeSubjectId(subjectId) {
  const id = Number(subjectId)
  return Number.isFinite(id) ? id : null
}

export function isSameSubjectStudent(student, membershipId, userId = null) {
  const normalizedMembershipId = Number(membershipId)
  const studentMembershipId = getSubjectStudentMembershipId(student)

  if (
    Number.isFinite(normalizedMembershipId) &&
    studentMembershipId != null &&
    studentMembershipId === normalizedMembershipId
  ) {
    return true
  }

  if (userId == null || student?.user_id == null) return false
  return Number(student.user_id) === Number(userId)
}

export async function resolveStudentEnrolledSubjectIds(membershipId, userId = null) {
  const normalizedMembershipId = Number(membershipId)
  if (!Number.isFinite(normalizedMembershipId)) return []

  const subjectsRes = await getSubjects()
  const subjects = (subjectsRes.subjects || []).filter((subject) => !subject.is_archived)

  const results = await Promise.all(
    subjects.map(async (subject) => {
      const subjectId = normalizeSubjectId(subject.id)
      if (!subjectId) return null

      try {
        const data = await getSubjectStudents(subjectId)
        const students = data.students || data.enrollments || data.assignments || []
        const enrolled = students.some((student) =>
          isSameSubjectStudent(student, normalizedMembershipId, userId),
        )
        return enrolled ? subjectId : null
      } catch {
        return null
      }
    }),
  )

  return results.filter(Boolean)
}

export function isStudentEnrolledInSubject(enrolledIds, subjectId) {
  const normalizedSubjectId = normalizeSubjectId(subjectId)
  if (!normalizedSubjectId) return false

  return enrolledIds.some((id) => Number(id) === normalizedSubjectId)
}
