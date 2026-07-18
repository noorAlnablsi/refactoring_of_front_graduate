import { useAuthStore } from '../store/authStore'
import { QUESTION_BANK_TABS } from './questionBanks'

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

export function isStudentMembership(membership = getActiveMembership()) {
  return String(membership?.role || '').trim().toUpperCase() === 'STUDENT'
}

export function canAccessStudentDashboard() {
  return isStudentMembership()
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

export function canAccessMembersModule() {
  const membership = getActiveMembership()
  if (!membership) return false
  if (membership.role === 'STUDENT') return false
  return membership.is_owner || membership.role === 'ADMIN'
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

export function canSendInvites() {
  const membership = getActiveMembership()
  if (!membership) return false
  if (membership.role === 'STUDENT') return false
  if (membership.workspace?.kind === 'SOLO') return true
  return membership.is_owner || membership.role === 'ADMIN'
}

export function canAccessExams() {
  const membership = getActiveMembership()
  if (!membership) return false
  return membership.role !== 'STUDENT'
}

export function canCreateExam() {
  return canAccessExams()
}

export function isInstitutionOwner(membership = getActiveMembership()) {
  return membership?.workspace?.kind === 'INSTITUTION' && Boolean(membership?.is_owner)
}

export function isSoloTeacher(membership = getActiveMembership()) {
  return membership?.workspace?.kind === 'SOLO'
}

export function canManageSubjectTopics() {
  return canCreateSubject()
}

export function isInstitutionWorkspace() {
  return getActiveMembership()?.workspace?.kind === 'INSTITUTION'
}

export function isQuestionBankOwner(bank) {
  const membership = getActiveMembership()
  if (!membership || !bank) return false

  const creatorId =
    bank.created_by_membership_id ??
    bank.creator_membership_id ??
    bank.created_by?.membership_id

  if (creatorId == null) return false
  return Number(creatorId) === Number(membership.membership_id)
}

function isInstitutionManager() {
  const membership = getActiveMembership()
  if (!membership) return false
  return membership.is_owner || membership.role === 'ADMIN'
}

/**
 * Edit questions / bank metadata:
 * - بنوكي (MY): creator only
 * - ضمن المؤسسة (WORKSPACE): creator, or institution owner/admin
 * - مجتمع (COMMUNITY): creator only (view-only for everyone else)
 */
export function canEditQuestionBank(bank, sourceTab) {
  const membership = getActiveMembership()
  if (!membership || !bank) return false

  if (isQuestionBankOwner(bank)) return true

  if (
    sourceTab === QUESTION_BANK_TABS.WORKSPACE &&
    isInstitutionWorkspace() &&
    isInstitutionManager()
  ) {
    return true
  }

  return false
}

/** @deprecated Use canEditQuestionBank(bank, sourceTab) */
export function canManageQuestionBank(bank, sourceTab) {
  if (sourceTab) return canEditQuestionBank(bank, sourceTab)
  if (!bank) return false
  if (isQuestionBankOwner(bank)) return true
  return isInstitutionWorkspace() && isInstitutionManager()
}
