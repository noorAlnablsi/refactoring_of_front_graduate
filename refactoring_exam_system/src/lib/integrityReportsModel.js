function asNumber(value, fallback = null) {
  if (value == null || value === '') return fallback
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function pick(row, keys, fallback = null) {
  for (const key of keys) {
    if (row?.[key] != null && row[key] !== '') return row[key]
  }
  return fallback
}

export const INTEGRITY_REPORT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DISMISSED: 'DISMISSED',
}

export function normalizeIntegrityReport(row = {}) {
  return {
    id: row.id ?? null,
    attempt_id: row.attempt_id ?? null,
    test_id: row.test_id ?? null,
    subject_id: row.subject_id ?? null,
    workspace_id: row.workspace_id ?? null,
    teacher_membership_id: row.teacher_membership_id ?? null,
    student_membership_id: row.student_membership_id ?? null,
    student_name: pick(row, ['student_name', 'full_name'], '—'),
    teacher_name: pick(row, ['teacher_name'], '—'),
    subject_name: pick(row, ['subject_name'], '—'),
    test_name: pick(row, ['test_name', 'exam_name'], '—'),
    risk_percentage: asNumber(row.risk_percentage, null),
    violations_count: asNumber(row.violations_count, 0) ?? 0,
    recommendation: row.recommendation || null,
    recommendation_reason: row.recommendation_reason || null,
    termination_reason: row.termination_reason || null,
    status: String(row.status || INTEGRITY_REPORT_STATUS.PENDING).toUpperCase(),
    submitted_at: row.submitted_at || null,
    terminated_at: row.terminated_at || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    proctoring_session_id: row.proctoring_session_id ?? null,
    workspace_name: row.workspace_name || null,
    effective_violation_score: asNumber(row.effective_violation_score, null),
    high_severity_count: asNumber(row.high_severity_count, 0) ?? 0,
    medium_severity_count: asNumber(row.medium_severity_count, 0) ?? 0,
    low_severity_count: asNumber(row.low_severity_count, 0) ?? 0,
    final_score: asNumber(row.final_score, null),
    raw_score: asNumber(row.raw_score, null),
    maximum_score: asNumber(row.maximum_score, null),
    percentage: asNumber(row.percentage, null),
    started_at: row.started_at || null,
    submission_source: row.submission_source || null,
    reviewed_by: row.reviewed_by ?? row.reviewed_by_membership_id ?? null,
    reviewed_at: row.reviewed_at || null,
    review_note: row.review_note || null,
    avatar_url: row.avatar_url || row.student_avatar_url || null,
  }
}

export function normalizeIntegrityReportsList(payload = {}) {
  const reports = (payload.reports || payload.items || []).map(normalizeIntegrityReport)
  return {
    reports,
    total: asNumber(payload.total, reports.length) ?? reports.length,
    page: asNumber(payload.page, 1) ?? 1,
    per_page: asNumber(payload.per_page, 20) ?? 20,
    pages: asNumber(payload.pages, 1) ?? 1,
  }
}

export function isIntegrityReportPending(report) {
  return String(report?.status || '').toUpperCase() === INTEGRITY_REPORT_STATUS.PENDING
}
