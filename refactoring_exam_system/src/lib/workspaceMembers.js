import i18n from '../i18n'
import { normalizeWorkspaceTeacher } from './workspaceTeachers'
import { normalizeWorkspaceStudent as normalizeStudent } from './workspaceStudents'

function tMembers(key, options = {}) {
  return i18n.t(key, { ns: 'members', ...options })
}

export function normalizeWorkspaceStudent(student) {
  if (!student || typeof student !== 'object') return student

  return {
    ...normalizeStudent(student),
    memberKind: 'STUDENT',
  }
}

export function normalizeWorkspaceTeacherMember(teacher) {
  return {
    ...normalizeWorkspaceTeacher(teacher),
    memberKind: 'TEACHER',
  }
}

export function buildLatestMembers(students = [], teachers = [], limit = 5) {
  const items = [
    ...students.map(normalizeWorkspaceStudent),
    ...teachers.map(normalizeWorkspaceTeacherMember),
  ]

  return items
    .filter((member) => member?.created_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}

export function formatRelativeTimeAr(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return tMembers('relativeTime.now')
  if (minutes < 60) return tMembers('relativeTime.minutesAgo', { count: minutes })

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return tMembers('relativeTime.hoursAgo', { count: hours })

  const days = Math.floor(hours / 24)
  if (days === 1) return tMembers('relativeTime.yesterday')
  return tMembers('relativeTime.daysAgo', { count: days })
}

export function getMemberSubtitle(member) {
  const isTeacher =
    member?.memberKind === 'TEACHER' ||
    member?.workspace_role === 'TEACHER' ||
    member?.membership_role === 'TEACHER'

  if (isTeacher) {
    const count = member.assigned_subjects_count
    if (count != null) return tMembers('roles.teacherWithSubjects', { count })
    return tMembers('roles.teacher')
  }

  const count = member.enrolled_subjects_count
  if (count != null) return tMembers('roles.studentWithSubjects', { count })
  return tMembers('roles.student')
}

const STATUS_BADGE_CLASSES = {
  ACTIVE: 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]',
  PENDING: 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]',
  SUSPENDED: 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]',
}

function getStatusBadge(status, statusKey) {
  const className = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.PENDING
  const label = tMembers(`status.${statusKey}`, {
    defaultValue: tMembers('status.pending'),
  })

  return { label, className }
}

const MEMBER_STATUS_KEYS = {
  ACTIVE: 'active',
  PENDING: 'pending',
}

const TEACHER_STATUS_KEYS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
}

export function getMemberStatusBadge(status) {
  const statusKey = MEMBER_STATUS_KEYS[status] || 'pending'
  return getStatusBadge(status, statusKey)
}

export function getTeacherStatusBadge(status) {
  const statusKey = TEACHER_STATUS_KEYS[status] || 'pending'
  return getStatusBadge(status, statusKey)
}
