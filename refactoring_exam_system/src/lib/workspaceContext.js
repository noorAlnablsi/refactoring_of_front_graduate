import { useAuthStore } from '../store/authStore'
import { QUESTION_BANK_TABS } from './questionBanks'

export function getActiveMembership() {
  const { memberships, selected_membership_id } = useAuthStore.getState()
  if (!Array.isArray(memberships) || memberships.length === 0) return null

  if (selected_membership_id == null || selected_membership_id === '') {
    return memberships[0] || null
  }

  const selectedId = Number(selected_membership_id)
  return (
    memberships.find((m) => Number(m.membership_id) === selectedId) || memberships[0] || null
  )
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

/** Enroll workspace students into a subject (owner/admin in institution, solo owner). */
export function canAssignStudentsToSubject() {
  return canCreateSubject()
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

export function canAccessStudentGroups() {
  const membership = getActiveMembership()
  if (!membership) return false
  return membership.role !== 'STUDENT'
}

export function canShowStudentGroupsInSidebar() {
  const membership = getActiveMembership()
  if (!membership || membership.role === 'STUDENT') return false
  if (membership.role === 'TEACHER') return true
  if (membership.workspace?.kind === 'SOLO') return true
  return false
}

export function canMutateStudentGroups() {
  const membership = getActiveMembership()
  if (!membership || membership.role === 'STUDENT') return false
  if (membership.role === 'TEACHER') return true
  if (membership.workspace?.kind === 'SOLO' && membership.is_owner) return true
  return false
}

export function isStudentGroupOwner(group) {
  const membership = getActiveMembership()
  if (!membership || !group) return false
  const ownerId =
    group.createdByMembershipId ?? group.created_by_membership_id ?? group.owner_membership_id
  if (ownerId == null) return false
  return Number(ownerId) === Number(membership.membership_id)
}

export function canEditStudentGroup(group) {
  return canMutateStudentGroups() && isStudentGroupOwner(group)
}

export function canCreateExam() {
  return canAccessExams()
}

export function canAccessSurveys() {
  return Boolean(getActiveMembership())
}

export function canManageSurveys() {
  return canAccessExams()
}

export function canCreateSurvey() {
  return canCreateExam()
}

export function isInstitutionOwner(membership = getActiveMembership()) {
  return membership?.workspace?.kind === 'INSTITUTION' && Boolean(membership?.is_owner)
}

export function isSoloTeacher(membership = getActiveMembership()) {
  return membership?.workspace?.kind === 'SOLO'
}

export function isWorkspaceOwner(membership = getActiveMembership()) {
  return Boolean(membership?.is_owner)
}

export function canExportWorkspaceStudents(membership = getActiveMembership()) {
  return isWorkspaceOwner(membership)
}

export function canExportWorkspaceTeachers(membership = getActiveMembership()) {
  return isInstitutionOwner(membership)
}

export function canBulkImportWorkspaceMembers(membership = getActiveMembership()) {
  if (!membership) return false
  const kind = membership.workspace?.kind
  if (kind !== 'INSTITUTION' && kind !== 'SOLO') return false
  return Boolean(membership.is_owner || membership.role === 'ADMIN')
}

export function getBulkImportAllowedRoles(membership = getActiveMembership()) {
  if (!canBulkImportWorkspaceMembers(membership)) return []
  if (membership.workspace?.kind === 'SOLO') return ['STUDENT']
  return ['STUDENT', 'TEACHER', 'ADMIN']
}

export function canAccessIntegrityReports() {
  return canAccessExams()
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

export function isInstitutionManager(membership = getActiveMembership()) {
  if (!membership) return false
  return membership.is_owner || membership.role === 'ADMIN'
}

export function canListInstitutionWorkspaceTests(membership = getActiveMembership()) {
  return isInstitutionOwner(membership)
}

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

export function canManageQuestionBank(bank, sourceTab) {
  if (sourceTab) return canEditQuestionBank(bank, sourceTab)
  if (!bank) return false
  if (isQuestionBankOwner(bank)) return true
  return isInstitutionWorkspace() && isInstitutionManager()
}
