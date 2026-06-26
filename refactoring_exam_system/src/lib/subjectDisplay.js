const MEMBERSHIP_ROLE_LABELS = {
  ADMIN: 'مدير',
  TEACHER: 'معلم',
  OWNER: 'مالك',
}

const VISIBILITY_LABELS = {
  PRIVATE: 'خاص',
  WORKSPACE: 'المؤسسة',
  COMMUNITY: 'المجتمع',
}

export function getSubjectSummary(description, maxLength = 120) {
  if (!description?.trim()) {
    return 'تغطي هذه المادة المفاهيم الأساسية والمتقدمة ضمن المنهج التعليمي للمؤسسة.'
  }
  const text = description.trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export function getTeacherName(teacher) {
  if (teacher?.full_name) return teacher.full_name
  if (teacher?.name) return teacher.name
  if (teacher?.membership_role) {
    return MEMBERSHIP_ROLE_LABELS[teacher.membership_role] || teacher.membership_role
  }
  if (teacher?.membership_id) return `عضوية #${teacher.membership_id}`
  return 'معلم'
}

export function getTeacherSpecialty(teacher) {
  if (teacher?.specialty || teacher?.subject_specialty) {
    return teacher.specialty || teacher.subject_specialty
  }
  if (teacher?.email) return teacher.email
  if (teacher?.subject_role === 'TEACHER') return 'معلم مادة'
  if (teacher?.membership_role === 'TEACHER') return 'تخصص مادة دراسية'
  if (teacher?.membership_role) {
    const label = MEMBERSHIP_ROLE_LABELS[teacher.membership_role]
    return label ? `${label} — مسند للمادة` : 'مسند للمادة'
  }
  return 'مسند للمادة'
}

export function getTeacherAvatarUrl(teacher) {
  return teacher?.avatar_url || null
}

export function getQuestionBankName(bank) {
  return bank?.title || bank?.name || 'بنك أسئلة'
}

export function getQuestionBankVisibilityLabel(bank) {
  return VISIBILITY_LABELS[bank?.visibility] || bank?.visibility || ''
}

export function formatStatValue(value) {
  if (value === null || value === undefined || value === '—') return '—'
  if (typeof value === 'number') return value.toLocaleString('ar-EG')
  return value
}

function readCount(subject, keys, arrayKeys = []) {
  for (const key of keys) {
    const parts = key.split('.')
    let value = subject
    for (const part of parts) {
      value = value?.[part]
    }
    if (value != null && value !== '') {
      return Number(value)
    }
  }

  for (const key of arrayKeys) {
    if (Array.isArray(subject?.[key])) {
      return subject[key].length
    }
  }

  return null
}

export function getSubjectTeachersCount(subject) {
  return readCount(
    subject,
    ['teachers_count', 'teacher_count', 'stats.teachers_count', 'counts.teachers'],
    ['teachers'],
  )
}

export function getSubjectQuestionBanksCount(subject) {
  return readCount(
    subject,
    ['question_banks_count', 'banks_count', 'stats.question_banks_count', 'counts.question_banks'],
    ['question_banks'],
  )
}

export function getSubjectTestsCount(subject) {
  return readCount(
    subject,
    ['tests_count', 'exams_count', 'stats.tests_count', 'counts.tests'],
    ['tests', 'exams'],
  )
}

export function formatSubjectStatCount(value) {
  if (value === null || value === undefined) return '—'
  return formatStatValue(value)
}

export function sortByRecentDate(items, dateKeys = ['assigned_at', 'created_at', 'updated_at']) {
  return [...items].sort((a, b) => {
    const dateA = dateKeys.map((key) => a[key]).find(Boolean)
    const dateB = dateKeys.map((key) => b[key]).find(Boolean)
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return new Date(dateB) - new Date(dateA)
  })
}

function getSubjectTimestamp(subject) {
  const value = subject?.created_at || subject?.updated_at
  return value ? new Date(value).getTime() : 0
}

export function sortSubjects(subjects = [], sortKey = 'newest') {
  const list = [...subjects]

  if (sortKey === 'name') {
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'))
  }

  if (sortKey === 'oldest') {
    return list.sort((a, b) => getSubjectTimestamp(a) - getSubjectTimestamp(b))
  }

  return list.sort((a, b) => getSubjectTimestamp(b) - getSubjectTimestamp(a))
}
