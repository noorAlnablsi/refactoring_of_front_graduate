import { VIOLATION_SEVERITY } from '../../constants/proctoring'
import { normalizeMonitoringEventKey } from './monitoringModel'

function firstNonEmptyString(...candidates) {
  for (const value of candidates) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return null
}

export function buildStudentViolationWarning(payload = {}) {
  const violation = payload?.violation && typeof payload.violation === 'object' ? payload.violation : null
  const nestedPayload = payload?.payload && typeof payload.payload === 'object' ? payload.payload : null
  const nestedViolation =
    nestedPayload?.violation && typeof nestedPayload.violation === 'object'
      ? nestedPayload.violation
      : null
  const source = violation || nestedViolation || {}

  const severity = String(
    source.severity ||
      payload.severity ||
      nestedPayload?.severity ||
      VIOLATION_SEVERITY.LOW,
  ).toUpperCase()

  const eventType = normalizeMonitoringEventKey(
    source.violation_type ||
      source.type ||
      source.event_type ||
      source.reason ||
      payload.violation_type ||
      nestedPayload?.violation_type ||
      '',
  )

  const message = firstNonEmptyString(
    payload.message,
    source.message,
    source.description,
    source.reason,
    nestedPayload?.message,
    nestedPayload?.warning_message,
    nestedPayload?.description,
  )

  return {
    severity,
    message,
    eventType: eventType || null,
    violation: source && Object.keys(source).length ? source : violation || nestedViolation,
    payload,
  }
}
