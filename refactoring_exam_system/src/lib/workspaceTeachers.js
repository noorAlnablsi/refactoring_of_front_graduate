export function normalizeWorkspaceTeacher(teacher) {
  if (!teacher || typeof teacher !== 'object') return teacher

  const membershipId =
    teacher.membership_id ??
    teacher.workspace_membership_id ??
    (teacher.id != null && teacher.id !== teacher.user_id ? teacher.id : null)

  return {
    ...teacher,
    membership_id: membershipId ?? teacher.membership_id ?? null,
  }
}

export function getTeacherMembershipId(teacher) {
  return normalizeWorkspaceTeacher(teacher).membership_id ?? null
}

export function canAssignWorkspaceTeacher(teacher) {
  const normalized = normalizeWorkspaceTeacher(teacher)
  return Boolean(normalized.membership_id || normalized.user_id)
}

export function isWorkspaceTeacherAssigned(teacher, assignedMembershipIds) {
  const membershipId = getTeacherMembershipId(teacher)
  return membershipId ? assignedMembershipIds.includes(membershipId) : false
}
