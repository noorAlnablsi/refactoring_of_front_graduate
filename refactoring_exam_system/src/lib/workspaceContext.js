import { useAuthStore } from '../store/authStore'

export function getActiveMembership() {
  const { memberships, selected_membership_id } = useAuthStore.getState()
  return memberships.find((m) => m.membership_id === selected_membership_id) || memberships[0] || null
}

export function getWorkspaceId() {
  return getActiveMembership()?.workspace?.id ?? null
}

export function canAccessDashboard() {
  const membership = getActiveMembership()
  if (!membership) return false
  return membership.role !== 'STUDENT'
}

export function canAccessQuestionBanks() {
  const { user } = useAuthStore.getState()
  const membership = getActiveMembership()
  if (!membership) return false
  if (user?.is_superadmin) return false
  return membership.role !== 'STUDENT'
}

export function canAccessSubjectsModule() {
  const membership = getActiveMembership()
  if (!membership) return false
  if (membership.role === 'STUDENT') return false
  if (membership.workspace?.kind === 'INSTITUTION' && membership.role === 'TEACHER') return false
  return true
}

export function canCreateSubject() {
  const membership = getActiveMembership()
  if (!membership) return false
  if (membership.role === 'STUDENT') return false
  if (membership.workspace?.kind === 'SOLO') return true
  if (membership.role === 'TEACHER') return false
  return membership.is_owner || membership.role === 'ADMIN'
}

export function canEditSubject() {
  return canCreateSubject()
}

export function canAssignTeachers() {
  const membership = getActiveMembership()
  if (!membership) return false
  if (membership.workspace?.kind !== 'INSTITUTION') return false
  return membership.is_owner || membership.role === 'ADMIN'
}

export function isInstitutionWorkspace() {
  return getActiveMembership()?.workspace?.kind === 'INSTITUTION'
}

export function canManageQuestionBank(bank) {
  const membership = getActiveMembership()
  if (!membership || !bank) return false
  if (bank.created_by_membership_id === membership.membership_id) return true
  return membership.is_owner || membership.role === 'ADMIN'
}
