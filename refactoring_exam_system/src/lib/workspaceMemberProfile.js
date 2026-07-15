import { getStudentMembershipId } from './workspaceStudents'
import { getTeacherMembershipId } from './workspaceTeachers'

export function getMemberMembershipId(member) {
  return getStudentMembershipId(member) ?? getTeacherMembershipId(member) ?? null
}
