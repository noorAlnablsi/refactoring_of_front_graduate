import { getSubjectTeachers, getSubjects } from '../services/subjects.service'
import { getTeacherMembershipSubjects } from '../services/memberships.service'

export async function resolveTeacherAssignedSubjectIds(membershipId) {
  if (!membershipId) return []

  try {
    const data = await getTeacherMembershipSubjects(membershipId)
    const subjects = data.assigned_subjects || data.subjects || []
    if (subjects.length) {
      return subjects.map((subject) => subject.id)
    }
  } catch {
    // fallback below
  }

  const subjectsRes = await getSubjects()
  const subjects = (subjectsRes.subjects || []).filter((subject) => !subject.is_archived)

  const results = await Promise.all(
    subjects.map(async (subject) => {
      try {
        const data = await getSubjectTeachers(subject.id)
        const teachers = data.teachers || []
        const assigned = teachers.some(
          (teacher) => Number(teacher.membership_id) === Number(membershipId),
        )
        return assigned ? subject.id : null
      } catch {
        return null
      }
    }),
  )

  return results.filter(Boolean)
}
