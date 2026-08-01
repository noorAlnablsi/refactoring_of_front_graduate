/**
 * Keeps attempt + proctoring service alive when navigating Entry → Attempt.
 * Cleared on submit or explicit abort.
 *
 * Ownership / handoff:
 * - entry:    Entry owns the live service (leaving Entry must stop it)
 * - pending:  Entry released ownership for navigate; Attempt must adopt (do NOT stop)
 * - adopted:  Attempt owns the service; React remounts must NOT stop it
 *             (Strict Mode / route remount). Explicit stop() still always stops.
 */

export const PROCTORING_HANDOFF = {
  ENTRY: 'entry',
  PENDING: 'pending',
  ADOPTED: 'adopted',
}

let activeBridge = null
/** Bumps on each Attempt mount; used to ignore Strict Mode false-unmount releases. */
let attemptOwnerGeneration = 0

export function setEntryProctoringBridge(bridge) {
  if (!bridge) {
    activeBridge = null
    return
  }

  activeBridge = {
    ...bridge,
    handoffStatus:
      bridge.handoffStatus ||
      (bridge.service ? PROCTORING_HANDOFF.ENTRY : activeBridge?.handoffStatus) ||
      null,
  }
}

export function getEntryProctoringBridge(testId) {
  if (!activeBridge) return null
  if (String(activeBridge.testId) !== String(testId)) return null
  return activeBridge
}

/**
 * Call synchronously BEFORE navigate(Entry → Attempt).
 * Ensures Entry unmount cleanup will not destroy the live service.
 */
export function markEntryProctoringHandoffPending() {
  if (!activeBridge?.service) return false
  activeBridge.handoffStatus = PROCTORING_HANDOFF.PENDING
  return true
}

/**
 * Attempt takes ownership of the same ProctoringService instance.
 */
export function claimEntryProctoringHandoff(service) {
  if (!activeBridge || !service) return false
  if (activeBridge.service !== service) return false
  activeBridge.handoffStatus = PROCTORING_HANDOFF.ADOPTED
  return true
}

/**
 * Hook unmount must stop only when this hook still owns the service.
 * Skip while handoff is pending OR adopted (service lives on the bridge across remounts).
 * Explicit proctoring.stop() always stops regardless of this helper.
 */
export function shouldStopProctoringServiceOnRelease(service) {
  if (!service) return false
  if (!activeBridge?.service) return true
  if (activeBridge.service !== service) return true

  const status = activeBridge.handoffStatus
  if (status === PROCTORING_HANDOFF.PENDING || status === PROCTORING_HANDOFF.ADOPTED) {
    return false
  }
  return true
}

/**
 * Call on Attempt mount. Returns a generation token for deferred release.
 */
export function beginAttemptProctoringOwnership() {
  attemptOwnerGeneration += 1
  return attemptOwnerGeneration
}

/**
 * On Attempt unmount: defer stop so React Strict Mode remount can reclaim ownership.
 * If generation is still current after the microtask, the page really left → stop.
 */
export function scheduleReleaseAttemptProctoring(generation, { stop } = {}) {
  queueMicrotask(() => {
    if (generation !== attemptOwnerGeneration) {
      console.info('[ATTEMPT REMOUNT]', { skippedStop: true, generation })
      return
    }
    console.info('[ATTEMPT LEAVE]', { generation })
    void stop?.()
    clearEntryProctoringBridge()
  })
}

/**
 * Clear bridge. If handoff never completed (still pending), stop the orphan service
 * so WS / camera / listeners are not leaked.
 */
export function clearEntryProctoringBridge() {
  const bridge = activeBridge
  activeBridge = null

  if (
    bridge?.handoffStatus === PROCTORING_HANDOFF.PENDING &&
    bridge.service &&
    !bridge.service.stopped
  ) {
    void bridge.service.stop?.()
  }
}

/** @internal test helper */
export function __resetEntryProctoringBridgeForTests() {
  activeBridge = null
  attemptOwnerGeneration = 0
}
