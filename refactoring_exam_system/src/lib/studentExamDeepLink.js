import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/authStore'

const PENDING_EXAM_REDIRECT_KEY = 'quizhub:pendingStudentExamRedirect'

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase()
}

export function isStudentExamDeepLink(pathname = '') {
  return /^\/student\/exams\/[^/]+\/(entry|attempt)\/?$/.test(String(pathname))
}

export function getStudentMemberships(memberships = []) {
  return (memberships || []).filter((item) => normalizeRole(item?.role) === 'STUDENT')
}

export function pickStudentMembership(memberships = []) {
  const students = getStudentMemberships(memberships)
  if (students.length === 0) return null
  if (students.length === 1) return students[0]

  const selectedId = useAuthStore.getState().selected_membership_id
  const selected = students.find((item) => Number(item.membership_id) === Number(selectedId))
  return selected || students[0]
}

export function ensureStudentMembershipSelected(memberships = []) {
  const student = pickStudentMembership(memberships)
  if (!student) return null

  const selectedId = useAuthStore.getState().selected_membership_id
  if (Number(selectedId) !== Number(student.membership_id)) {
    useAuthStore.getState().setSelectedMembership(student.membership_id)
  }

  return student
}

export function stashPendingExamRedirect(pathname) {
  if (!isStudentExamDeepLink(pathname)) return
  try {
    sessionStorage.setItem(PENDING_EXAM_REDIRECT_KEY, pathname)
  } catch {
    /* ignore */
  }
}

export function consumePendingExamRedirect() {
  try {
    const value = sessionStorage.getItem(PENDING_EXAM_REDIRECT_KEY)
    if (value) sessionStorage.removeItem(PENDING_EXAM_REDIRECT_KEY)
    return isStudentExamDeepLink(value) ? value : null
  } catch {
    return null
  }
}

export function peekPendingExamRedirect() {
  try {
    const value = sessionStorage.getItem(PENDING_EXAM_REDIRECT_KEY)
    return isStudentExamDeepLink(value) ? value : null
  } catch {
    return null
  }
}

export function resolveExamLinkAfterAuth({ redirectTo, memberships }) {
  const target = isStudentExamDeepLink(redirectTo) ? redirectTo : null
  if (!target) return null

  const student = ensureStudentMembershipSelected(memberships)
  if (!student) return null

  return target
}

export function isStudentExamEntryRoute(pathname = '') {
  return pathname === ROUTES.STUDENT_EXAM_ENTRY || isStudentExamDeepLink(pathname)
}
