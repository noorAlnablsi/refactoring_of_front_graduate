/**
 * Keeps attempt + proctoring service alive when navigating Entry → Attempt.
 * Cleared on submit or explicit abort.
 */
let activeBridge = null

export function setEntryProctoringBridge(bridge) {
  activeBridge = bridge
}

export function getEntryProctoringBridge(testId) {
  if (!activeBridge) return null
  if (String(activeBridge.testId) !== String(testId)) return null
  return activeBridge
}

export function clearEntryProctoringBridge() {
  activeBridge = null
}
