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

function asStudentArray(value) {
  return Array.isArray(value) ? value : []
}

export function normalizeWorkspaceStudentsResponse(data = {}) {
  const nested =
    data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : null

  const root = nested ? { ...data, ...nested } : data || {}

  const listCandidate =
    root.students ??
    root.student_list ??
    root.workspace_students ??
    root.items ??
    root.results ??
    root.members ??
    (Array.isArray(root.data) ? root.data : null) ??
    (Array.isArray(data) ? data : null) ??
    []

  const students = asStudentArray(listCandidate)
    .map(normalizeWorkspaceStudent)
    .filter(Boolean)

  const totalRaw =
    root.total ??
    root.count ??
    root.students_count ??
    root.total_students ??
    root.pagination?.total ??
    root.meta?.total ??
    root.meta?.pagination?.total

  const totalNumber = Number(totalRaw)
  const total = Number.isFinite(totalNumber) ? totalNumber : students.length

  const pagesRaw =
    root.pages ?? root.pagination?.pages ?? root.meta?.pages ?? root.meta?.pagination?.pages
  const pagesNumber = Number(pagesRaw)

  return {
    ...root,
    students,
    total,
    count: total,
    pages: Number.isFinite(pagesNumber) && pagesNumber >= 1 ? pagesNumber : 1,
  }
}

export function mapDashboardMemberToWorkspaceStudent(member) {
  if (!member || typeof member !== 'object') return null

  const role = String(
    member.role || member.membership_role || member.workspace_role || '',
  ).toUpperCase()

  if (role !== 'STUDENT') return null

  return normalizeWorkspaceStudent({
    membership_id: member.membership_id ?? member.workspace_membership_id ?? null,
    user_id: member.user_id ?? null,
    full_name: member.full_name || member.name || '',
    email: member.email || '',
    phone: member.phone ?? member.phone_number ?? null,
    phone_number: member.phone_number ?? member.phone ?? null,
    avatar_url: member.avatar_url || member.profile_image_url || null,
    user_status: member.user_status || member.status || 'ACTIVE',
    membership_role: 'STUDENT',
    workspace_role: 'STUDENT',
    enrolled_subjects_count: member.enrolled_subjects_count ?? member.subjects_count ?? 0,
    created_at: member.joined_at || member.created_at || null,
    is_online: member.is_online,
  })
}
