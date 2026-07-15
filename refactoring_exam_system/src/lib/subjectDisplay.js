import i18n from '../i18n'

function tCommon(key, options = {}) {
  return i18n.t(key, { ns: 'common', ...options })
}

function tSubjects(key, options = {}) {
  return i18n.t(key, { ns: 'subjects', ...options })
}

function tQuestionBanks(key, options = {}) {
  return i18n.t(key, { ns: 'questionBanks', ...options })
}

const MEMBERSHIP_ROLE_KEYS = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  OWNER: 'owner',
}

const VISIBILITY_KEYS = {
  PRIVATE: 'private',
  WORKSPACE: 'workspace',
  COMMUNITY: 'community',
}

function getMembershipRoleLabel(role) {
  const key = MEMBERSHIP_ROLE_KEYS[role]
  return key ? tCommon(`roles.${key}`) : role
}

export function getSubjectSummary(description, maxLength = 120) {
  if (!description?.trim()) {
    return tSubjects('display.defaultSummary')
  }
  const text = description.trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export function getTeacherName(teacher) {
  if (teacher?.full_name) return teacher.full_name
  if (teacher?.name) return teacher.name
  if (teacher?.membership_role) {
    return getMembershipRoleLabel(teacher.membership_role)
  }
  if (teacher?.membership_id) {
    return tSubjects('display.membershipId', { id: teacher.membership_id })
  }
  return tCommon('roles.teacher')
}

export function getTeacherSpecialty(teacher) {
  if (teacher?.specialty || teacher?.subject_specialty) {
    return teacher.specialty || teacher.subject_specialty
  }
  if (teacher?.email) return teacher.email
  if (teacher?.subject_role === 'TEACHER') return tSubjects('display.subjectTeacher')
  if (teacher?.membership_role === 'TEACHER') return tSubjects('display.subjectSpecialty')
  if (teacher?.membership_role) {
    const label = getMembershipRoleLabel(teacher.membership_role)
    return label
      ? tSubjects('display.assignedToSubjectWithRole', { role: label })
      : tSubjects('display.assignedToSubject')
  }
  return tSubjects('display.assignedToSubject')
}

export function getTeacherAvatarUrl(teacher) {
  return teacher?.avatar_url || null
}

export function getQuestionBankName(bank) {
  return bank?.title || bank?.name || tQuestionBanks('display.defaultName')
}

export function getQuestionBankVisibilityLabel(bank) {
  const visibility = bank?.visibility
  const key = VISIBILITY_KEYS[visibility]
  if (key) return tQuestionBanks(`visibility.${key}`)
  return visibility || ''
}

export function formatStatValue(value) {
  if (value === null || value === undefined || value === '—') return '—'
  if (typeof value === 'number') {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
    return value.toLocaleString(locale)
  }
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

export function formatSubjectTeachersLabel(subject) {
  const count = getSubjectTeachersCount(subject)
  if (count === null || count === undefined) return '—'
  return tSubjects('display.teachersCount', { count: formatStatValue(count) })
}

export function formatSubjectBanksLabel(subject) {
  const count = getSubjectQuestionBanksCount(subject)
  if (count === null || count === undefined) return '—'
  return tSubjects('display.banksCount', { count: formatStatValue(count) })
}

export function formatSubjectTestsLabel(subject) {
  const count = getSubjectTestsCount(subject)
  if (count === null || count === undefined) return '—'
  return tSubjects('display.testsCount', { count: formatStatValue(count) })
}

export function getSubjectTableSubtitle(subject) {
  if (subject?.description?.trim()) {
    return subject.description.trim()
  }
  if (subject?.department?.trim()) {
    return subject.department.trim()
  }
  return tSubjects('display.defaultSubtitle')
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
    const locale = i18n.language === 'ar' ? 'ar' : 'en'
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', locale))
  }

  if (sortKey === 'oldest') {
    return list.sort((a, b) => getSubjectTimestamp(a) - getSubjectTimestamp(b))
  }

  return list.sort((a, b) => getSubjectTimestamp(b) - getSubjectTimestamp(a))
}
