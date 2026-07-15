export function normalizeWorkspaceStudent(student) {
  if (!student || typeof student !== 'object') return student

  const membershipId =
    student.membership_id ??
    student.workspace_membership_id ??
    (student.id != null && student.id !== student.user_id ? student.id : null)

  return {
    ...student,
    membership_id: membershipId ?? student.membership_id ?? null,
    phone: student.phone ?? student.phone_number ?? null,
  }
}

export function getStudentMembershipId(student) {
  const normalized = normalizeWorkspaceStudent(student)
  const rawId = normalized.membership_id

  if (rawId == null || rawId === '') return null

  const membershipId = Number(rawId)
  return Number.isFinite(membershipId) ? membershipId : null
}

export function isStudentCurrentlyActive(student) {
  if (!student) return false

  if (student.is_online === true || student.is_currently_active === true) {
    return true
  }

  if (student.presence_status === 'ONLINE' || student.presence === 'ONLINE') {
    return true
  }

  return student.user_status === 'ACTIVE'
}
