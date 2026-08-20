import i18n from '../i18n'
import { formatLocaleNumber } from './localeNumber'

function getDateLocale() {
  return String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function normalizeStudentGroup(raw) {
  if (!raw) return null
  const subject =
    raw.subject && typeof raw.subject === 'object'
      ? { id: raw.subject.id, name: String(raw.subject.name || '').trim() || '—' }
      : { id: raw.subject_id, name: '—' }

  const students = Array.isArray(raw.students)
    ? raw.students.map((student) => ({
        id: student.membership_id ?? student.id,
        membershipId: student.membership_id ?? student.id,
        userId: student.user_id ?? null,
        fullName: String(student.full_name || student.name || '').trim() || '—',
        email: String(student.email || '').trim() || '—',
      }))
    : []

  const studentCount = Number(raw.student_count ?? raw.member_count ?? students.length) || 0

  return {
    id: raw.id,
    name: String(raw.name || '').trim() || '—',
    description: String(raw.description || '').trim(),
    subjectId: raw.subject_id ?? subject.id,
    subject,
    workspaceId: raw.workspace_id,
    createdByMembershipId: raw.created_by_membership_id ?? raw.owner_membership_id ?? null,
    ownerName: String(raw.owner_name || '').trim() || '—',
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
    studentCount,
    students,
  }
}

export function normalizeAvailableStudent(raw) {
  const currentGroup =
    raw?.current_group && typeof raw.current_group === 'object'
      ? {
          id: raw.current_group.id,
          name: String(raw.current_group.name || '').trim() || '—',
          ownerName: String(raw.current_group.owner_name || '').trim() || '—',
          ownerMembershipId: raw.current_group.owner_membership_id ?? null,
        }
      : null

  return {
    membershipId: raw.membership_id ?? raw.id,
    fullName: String(raw.full_name || raw.name || '').trim() || '—',
    email: String(raw.email || '').trim() || '—',
    isAvailable: Boolean(raw.is_available),
    currentGroup,
  }
}

export function formatGroupCreatedAt(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatGroupStudentCount(count) {
  return i18n.t('table.studentsCount', {
    ns: 'groups',
    count: formatLocaleNumber(count ?? 0),
  })
}

export function getGroupConflictPayload(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return null
  if (data.error !== 'STUDENT_GROUP_SUBJECT_CONFLICT' && !Array.isArray(data.conflicts)) {
    return null
  }
  return {
    message: data.message || error.message,
    conflicts: Array.isArray(data.conflicts) ? data.conflicts : [],
  }
}
