import { normalizeWorkspaceTeacher } from './workspaceTeachers'

export function normalizeWorkspaceStudent(student) {
  if (!student || typeof student !== 'object') return student

  return {
    ...student,
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

  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'أمس'
  return `منذ ${days} يوم`
}

export function getMemberSubtitle(member) {
  const isTeacher =
    member?.memberKind === 'TEACHER' ||
    member?.workspace_role === 'TEACHER' ||
    member?.membership_role === 'TEACHER'

  if (isTeacher) {
    const count = member.assigned_subjects_count
    if (count != null) return `معلم • ${count} مواد`
    return 'معلم'
  }

  const count = member.enrolled_subjects_count
  if (count != null) return `طالب • ${count} مواد`
  return 'طالب'
}

const STATUS_BADGES = {
  ACTIVE: {
    label: 'نشط',
    className: 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]',
  },
  PENDING: {
    label: 'قيد الانتظار',
    className: 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]',
  },
}

export function getMemberStatusBadge(status) {
  return STATUS_BADGES[status] || STATUS_BADGES.PENDING
}
