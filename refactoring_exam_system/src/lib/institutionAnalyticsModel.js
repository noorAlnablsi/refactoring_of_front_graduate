import i18n from '../i18n'

function locale() {
  return String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
}

function asNumber(value, fallback = null) {
  if (value == null || value === '') return fallback
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function asMetric(raw) {
  if (raw == null || typeof raw !== 'object') {
    return { value: asNumber(raw, 0) ?? 0, change_percentage: null }
  }
  return {
    value: asNumber(raw.value, 0) ?? 0,
    change_percentage: asNumber(raw.change_percentage, null),
  }
}

function pickAvatar(row) {
  return row?.avatar_url || row?.profile_image_url || row?.photo_url || null
}

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

export function formatAnalyticsPercent(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const num = Number(value)
  const rounded = digits > 0 ? Math.round(num * 10 ** digits) / 10 ** digits : Math.round(num)
  return `${rounded.toLocaleString(locale())}%`
}

export function formatAnalyticsCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString(locale())
}

export function formatChangePercentage(value) {
  const num = asNumber(value, null)
  if (num == null) return null
  const abs = Math.abs(Math.round(num * 10) / 10)
  const sign = num > 0 ? '+' : num < 0 ? '−' : ''
  return `${sign}${abs.toLocaleString(locale())}%`
}

export function formatPeriodLabel(period) {
  if (!period) return ''
  const match = String(period).match(/^(\d{4})-(\d{2})$/)
  if (!match) return String(period)
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1)
  if (Number.isNaN(date.getTime())) return String(period)
  return date.toLocaleDateString(locale(), { month: 'short', year: 'numeric' })
}

export function formatAnalyticsDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' })
}

export function daysSince(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const diff = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

export function toIsoDateInput(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** BE LocalDateTime accepts ISO; date-only becomes midnight — use full day bounds. */
export function toAnalyticsDateFrom(dateStr) {
  if (!dateStr) return undefined
  if (String(dateStr).includes('T')) return dateStr
  return `${dateStr}T00:00:00`
}

export function toAnalyticsDateTo(dateStr) {
  if (!dateStr) return undefined
  if (String(dateStr).includes('T')) return dateStr
  return `${dateStr}T23:59:59`
}

export function buildDateRangePreset(preset) {
  const to = new Date()
  to.setHours(23, 59, 59, 999)
  const from = new Date()
  from.setHours(0, 0, 0, 0)

  const days =
    preset === '7d' ? 7 : preset === '90d' ? 90 : preset === '30d' ? 30 : null

  if (days == null) return null

  from.setDate(from.getDate() - (days - 1))
  return {
    date_from: toIsoDateInput(from),
    date_to: toIsoDateInput(to),
  }
}

export function normalizeOverview(overview = {}) {
  return {
    total_students: asMetric(overview.total_students),
    total_teachers: asMetric(overview.total_teachers),
    total_tests: asMetric(overview.total_tests),
    total_attempts: asMetric(overview.total_attempts),
    institution_average_score: asMetric(overview.institution_average_score),
    active_students: asMetric(overview.active_students),
  }
}

export function normalizePassFail(passFail = {}) {
  return {
    pass_rate: asNumber(passFail.pass_rate, 0) ?? 0,
    fail_rate: asNumber(passFail.fail_rate, 0) ?? 0,
    passed_attempts: asNumber(passFail.passed_attempts, 0) ?? 0,
    failed_attempts: asNumber(passFail.failed_attempts, 0) ?? 0,
  }
}

export function normalizeMonthlyScores(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    period: row.period || row.month || '',
    average_score: asNumber(row.average_score ?? row.avg_score, 0) ?? 0,
    label: formatPeriodLabel(row.period || row.month || ''),
  }))
}

export function normalizeEngagedSubject(row = {}) {
  return {
    subject_id: row.subject_id ?? null,
    subject_name: row.subject_name || row.name || '—',
    students_count: asNumber(row.students_count, 0) ?? 0,
    teachers_count: asNumber(row.teachers_count, 0) ?? 0,
    tests_count: asNumber(row.tests_count, 0) ?? 0,
    // BE has no attempts_count; keep optional fallback only if present later.
    attempts_count: asNumber(row.attempts_count, null),
    average_score: asNumber(row.average_score, null),
    activity_score: asNumber(row.activity_score, null),
  }
}

export function normalizeRankedSubject(row = {}) {
  return {
    subject_id: row.subject_id ?? null,
    subject_name: row.subject_name || row.name || '—',
    average_score: asNumber(row.average_score, null),
  }
}

export function normalizeTeacherActivity(row = {}) {
  const name =
    row.teacher_name || row.full_name || row.name || row.user?.full_name || '—'
  return {
    teacher_membership_id: row.teacher_membership_id ?? row.membership_id ?? null,
    teacher_name: name,
    avatar_url: pickAvatar(row) || pickAvatar(row.user),
    initials: initialsFromName(name),
    tests_created: asNumber(row.tests_created ?? row.tests_count ?? row.created_tests_count, 0) ?? 0,
    targeted_students:
      asNumber(row.targeted_students ?? row.students_count ?? row.students_targeted, 0) ?? 0,
    // BE field: average_student_score
    average_score: asNumber(row.average_student_score ?? row.average_score, null),
    completion_rate: asNumber(row.completion_rate, null),
  }
}

export function normalizeTopStudent(row = {}) {
  const name =
    row.student_name || row.full_name || row.name || row.user?.full_name || '—'
  return {
    student_membership_id: row.student_membership_id ?? row.membership_id ?? null,
    student_name: name,
    // BE field: profile_image (= User.profile_image_url)
    avatar_url: row.profile_image || pickAvatar(row) || pickAvatar(row.user),
    initials: initialsFromName(name),
    completed_tests:
      asNumber(row.completed_tests ?? row.tests_completed ?? row.attempts_count, 0) ?? 0,
    average_score: asNumber(row.average_score, null),
  }
}

export function normalizeInactiveStudent(row = {}) {
  const name =
    row.student_name || row.full_name || row.name || row.user?.full_name || '—'
  const lastActivity = row.last_activity_at || row.last_active_at || row.last_login_at || null
  const inactiveDays =
    asNumber(row.days_inactive ?? row.inactive_days, null) ?? daysSince(lastActivity)
  return {
    student_membership_id: row.student_membership_id ?? row.membership_id ?? null,
    student_name: name,
    avatar_url: row.profile_image || pickAvatar(row) || pickAvatar(row.user),
    initials: initialsFromName(name),
    last_activity_at: lastActivity,
    days_inactive: inactiveDays,
  }
}

export function normalizeProblematicExam(row = {}) {
  return {
    test_id: row.test_id ?? null,
    test_name: row.test_name || row.name || '—',
    // BE returns subject_name (not teacher_name) on problematic_exams
    subject_name: row.subject_name || null,
    teacher_name: row.teacher_name || row.created_by_name || null,
    reports_count:
      asNumber(row.reports_count ?? row.integrity_reports_count ?? row.flagged_attempts, 0) ?? 0,
    violations_count: asNumber(row.violations_count, 0) ?? 0,
    average_score: asNumber(row.average_score, null),
    risk_percentage: asNumber(row.risk_percentage ?? row.avg_risk_percentage ?? row.risk, null),
  }
}

export function normalizeInstitutionAnalytics(payload = {}) {
  return {
    filters: payload.filters || {},
    overview: normalizeOverview(payload.overview || {}),
    passFail: normalizePassFail(payload.pass_fail || {}),
    monthlyScores: normalizeMonthlyScores(payload.monthly_average_scores || []),
    mostEngagedSubjects: (payload.most_engaged_subjects || []).map(normalizeEngagedSubject),
    bestSubjects: (payload.best_subjects || []).map(normalizeRankedSubject),
    weakestSubjects: (payload.weakest_subjects || []).map(normalizeRankedSubject),
    teacherActivity: (payload.teacher_activity || []).map(normalizeTeacherActivity),
    topStudents: (payload.top_students || []).map(normalizeTopStudent),
    inactiveStudents: (payload.inactive_students || []).map(normalizeInactiveStudent),
    problematicExams: (payload.problematic_exams || []).map(normalizeProblematicExam),
  }
}
