export const MONITORING_STATE = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  TIMED_OUT: 'TIMED_OUT',
  FORCE_SUBMITTED: 'FORCE_SUBMITTED',
  PROCTORING_AUTO_TERMINATED: 'PROCTORING_AUTO_TERMINATED',
  TERMINATED: 'TERMINATED',
  COMPLETED: 'COMPLETED',
}

export function normalizeMonitoringSnapshot(data) {
  const monitoring = data?.monitoring || {}
  const students = Array.isArray(data?.students)
    ? data.students.map(normalizeMonitoringStudent).filter(Boolean)
    : []

  return {
    testId: data?.test_id ?? null,
    name: data?.name || data?.title || '—',
    count: Number(data?.count) || students.length,
    stats: {
      totalAssigned: Number(monitoring.total_assigned_students) || 0,
      notStarted: Number(monitoring.not_started) || 0,
      inProgress: Number(monitoring.in_progress) || 0,
      submitted: Number(monitoring.submitted) || 0,
      timedOut: Number(monitoring.timed_out) || 0,
      forceSubmitted: Number(monitoring.force_submitted) || 0,
      proctoringAutoTerminated: Number(monitoring.proctoring_auto_terminated) || 0,
      terminated: Number(monitoring.terminated) || 0,
      completed: Number(monitoring.completed) || 0,
    },
    students,
  }
}

export function normalizeMonitoringStudent(raw) {
  if (!raw) return null
  return {
    studentMembershipId: raw.student_membership_id,
    fullName: raw.full_name || raw.student_name || `Student #${raw.student_membership_id}`,
    attemptId: raw.attempt_id ?? null,
    attemptStatus: raw.attempt_status || null,
    submissionSource: raw.submission_source || null,
    terminationReason: raw.termination_reason || null,
    proctoringSessionId: raw.proctoring_session_id ?? null,
    proctoringSessionStatus: raw.proctoring_session_status || null,
    monitoringState: String(raw.monitoring_state || MONITORING_STATE.NOT_STARTED).toUpperCase(),
    effectiveViolationScore: raw.effective_violation_score ?? 0,
    riskPercentage: raw.risk_percentage ?? 0,
    violationCount: Number(raw.violation_count) || 0,
    eventCount: Number(raw.event_count) || 0,
    lastActivityAt: raw.last_activity_at || null,
  }
}

/** Apply WS `student_row_updated.changes` onto a normalized student row. */
export function applyStudentRowChanges(student, changes = {}) {
  if (!student || !changes || typeof changes !== 'object') return student
  return {
    ...student,
    attemptId: changes.attempt_id ?? student.attemptId,
    attemptStatus: changes.attempt_status ?? student.attemptStatus,
    submissionSource: changes.submission_source ?? student.submissionSource,
    terminationReason: changes.termination_reason ?? student.terminationReason,
    proctoringSessionId: changes.proctoring_session_id ?? student.proctoringSessionId,
    proctoringSessionStatus: changes.proctoring_session_status ?? student.proctoringSessionStatus,
    monitoringState: changes.monitoring_state
      ? String(changes.monitoring_state).toUpperCase()
      : student.monitoringState,
    effectiveViolationScore:
      changes.effective_violation_score ?? student.effectiveViolationScore,
    riskPercentage: changes.risk_percentage ?? student.riskPercentage,
    violationCount:
      changes.violation_count != null ? Number(changes.violation_count) : student.violationCount,
    eventCount: changes.event_count != null ? Number(changes.event_count) : student.eventCount,
    lastActivityAt: changes.last_activity_at ?? student.lastActivityAt,
  }
}

export function normalizeAuditLog(raw) {
  if (!raw) return null
  return {
    id: raw.id ?? `audit-${raw.created_at || ''}-${raw.action || 'log'}`,
    kind: 'audit',
    eventType: raw.action || raw.event_type || raw.type || raw.violation_type || 'EVENT',
    severity: raw.severity || null,
    message: raw.message || raw.description || formatDetailsMessage(raw.details) || null,
    createdAt: raw.created_at || raw.timestamp || null,
    payload: raw.payload || raw.details || null,
  }
}

export function normalizeProctoringEvent(raw) {
  if (!raw) return null
  return {
    id: raw.id ?? `event-${raw.occurred_at || raw.created_at || ''}-${raw.event_type || 'evt'}`,
    kind: 'event',
    eventType: raw.event_type || raw.type || 'EVENT',
    severity: null,
    message: null,
    createdAt: raw.occurred_at || raw.created_at || raw.timestamp || null,
    payload: raw.payload || null,
  }
}

export function normalizeProctoringViolation(raw) {
  if (!raw) return null
  return {
    id: raw.id ?? `violation-${raw.created_at || ''}-${raw.violation_type || 'v'}`,
    kind: 'violation',
    eventType: raw.violation_type || raw.type || 'VIOLATION',
    severity: raw.severity || null,
    message: raw.description || raw.message || null,
    createdAt: raw.created_at || raw.timestamp || null,
    payload: raw.payload || null,
  }
}

/** Merge events + violations + audit rows into one newest-first timeline for the detail drawer. */
export function buildMonitoringTimeline({ events = [], violations = [], auditLogs = [] } = {}) {
  const rows = [
    ...events.map(normalizeProctoringEvent),
    ...violations.map(normalizeProctoringViolation),
    ...auditLogs.map(normalizeAuditLog),
  ].filter(Boolean)

  return rows.sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0
    return tb - ta
  })
}

function formatDetailsMessage(details) {
  if (!details || typeof details !== 'object') return null
  try {
    return JSON.stringify(details)
  } catch {
    return null
  }
}
