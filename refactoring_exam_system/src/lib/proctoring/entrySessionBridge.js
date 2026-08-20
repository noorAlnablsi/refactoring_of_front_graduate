

export const PROCTORING_HANDOFF = {
  ENTRY: 'entry',
  PENDING: 'pending',
  ADOPTED: 'adopted',
}

let activeBridge = null

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


export function markEntryProctoringHandoffPending() {
  if (!activeBridge?.service) return false
  activeBridge.handoffStatus = PROCTORING_HANDOFF.PENDING
  return true
}


export function claimEntryProctoringHandoff(service) {
  if (!activeBridge || !service) return false
  if (activeBridge.service !== service) return false
  activeBridge.handoffStatus = PROCTORING_HANDOFF.ADOPTED
  return true
}


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


export function beginAttemptProctoringOwnership() {
  attemptOwnerGeneration += 1
  return attemptOwnerGeneration
}


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


export function __resetEntryProctoringBridgeForTests() {
  activeBridge = null
  attemptOwnerGeneration = 0
}
