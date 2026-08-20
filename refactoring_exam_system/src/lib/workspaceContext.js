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

/** Teacher / owner / admin (non-student) can open student groups module. */
/** Route access: teachers, SOLO, and institution owner/admin (monitor via Members). */
export function canAccessStudentGroups() {
  const membership = getActiveMembership()
  if (!membership) return false
  return membership.role !== 'STUDENT'
}

/**
 * Sidebar item only for teachers / SOLO.
 * Institution owner/ADMIN open groups from Members management, not the sidebar.
 */
export function canShowStudentGroupsInSidebar() {
  const membership = getActiveMembership()
  if (!membership || membership.role === 'STUDENT') return false
  if (membership.role === 'TEACHER') return true
  if (membership.workspace?.kind === 'SOLO') return true
  return false
}

/**
 * Create / edit / members: subject teachers (and SOLO owner acting as teacher).
 * Institution owner/ADMIN without TEACHER role = monitor only.
 */
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
  const ownerId = group.createdByMembershipId ?? group.created_by_membership_id
  if (ownerId == null) return false
  return Number(ownerId) === Number(membership.membership_id)
}

export function canEditStudentGroup(group) {
  return canMutateStudentGroups() && isStudentGroupOwner(group)
}

export function canCreateExam() {
  return canAccessExams()
}

/** Any active workspace member can open the surveys module (answer or manage). */
export function canAccessSurveys() {
  return Boolean(getActiveMembership())
}

/** Create / manage surveys — same boundary as exams (non-student staff). */
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

/** Workspace owner (INSTITUTION or SOLO) — matches students CSV export. */
export function isWorkspaceOwner(membership = getActiveMembership()) {
  return Boolean(membership?.is_owner)
}

/** GET /workspaces/students/export — owner only. */
export function canExportWorkspaceStudents(membership = getActiveMembership()) {
  return isWorkspaceOwner(membership)
}

/** GET /workspaces/teachers/export — institution owner only. */
export function canExportWorkspaceTeachers(membership = getActiveMembership()) {
  return isInstitutionOwner(membership)
}

/**
 * POST /workspaces/members/import-csv — owner or ADMIN (INSTITUTION or SOLO).
 * Role limits: SOLO → STUDENT only; INSTITUTION → STUDENT|TEACHER|ADMIN.
 */
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

/**
 * Integrity reports inbox (GET /proctoring/integrity-reports).
 * Owner sees all; test creators see their tests (BE filters). Students blocked.
 */
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

/** GET /workspaces/tests — all institution exams (owner/admin only). Teachers use GET /tests/my. */
export function canListInstitutionWorkspaceTests(membership = getActiveMembership()) {
  return isInstitutionWorkspace() && isInstitutionManager(membership)
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
