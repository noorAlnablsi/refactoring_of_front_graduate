import { TEST_AVAILABILITY_TIME_MODE } from '../constants/tests'

/** Frontend-only reconnect window. Not an extension of exam duration. */
export const OFFLINE_GRACE_SECONDS = 5 * 60

export const OFFLINE_PHASE = {
  ONLINE: 'online',
  GRACE: 'grace',
  FROZEN: 'frozen',
}

export const OFFLINE_FREEZE_REASON = {
  GRACE_EXPIRED: 'grace_expired',
  TIME_EXPIRED_OFFLINE: 'time_expired_offline',
}

/**
 * Resolve availability mode from test payload (student or teacher shapes).
 */
export function resolveAttemptAvailabilityMode(test) {
  const mode =
    test?.availability_time_mode ||
    test?.availability_mode ||
    test?.settings_config?.availability_time_mode

  if (String(mode || '').toUpperCase() === TEST_AVAILABILITY_TIME_MODE.SCHEDULED) {
    return TEST_AVAILABILITY_TIME_MODE.SCHEDULED
  }
  return TEST_AVAILABILITY_TIME_MODE.FLEXIBLE
}

/**
 * When true: offline starts a 5-minute grace; after it expires answers freeze
 * and submit runs on reconnect.
 * When false (FLEXIBLE + no proctoring): student may keep answering offline until
 * exam remaining time hits 0, then freeze and submit on reconnect.
 */
export function shouldEnforceOfflineGrace({ availabilityMode, proctoringEnabled }) {
  if (availabilityMode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED) return true
  if (proctoringEnabled) return true
  return false
}

export function computeGraceRemainingSeconds(disconnectedAtMs, nowMs = Date.now(), graceSeconds = OFFLINE_GRACE_SECONDS) {
  if (!disconnectedAtMs) return graceSeconds
  const elapsed = Math.floor((nowMs - Number(disconnectedAtMs)) / 1000)
  return Math.max(0, graceSeconds - elapsed)
}
