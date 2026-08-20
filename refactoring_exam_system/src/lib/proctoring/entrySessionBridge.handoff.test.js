
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  PROCTORING_HANDOFF,
  __resetEntryProctoringBridgeForTests,
  setEntryProctoringBridge,
  getEntryProctoringBridge,
  markEntryProctoringHandoffPending,
  claimEntryProctoringHandoff,
  shouldStopProctoringServiceOnRelease,
  clearEntryProctoringBridge,
  beginAttemptProctoringOwnership,
  scheduleReleaseAttemptProctoring,
} from './entrySessionBridge.js'

function fakeService() {
  return {
    stopped: false,
    async stop() {
      this.stopped = true
    },
  }
}

describe('entrySessionBridge handoff', () => {
  beforeEach(() => {
    __resetEntryProctoringBridgeForTests()
  })

  it('Entry leave without handoff must allow stop', () => {
    const service = fakeService()
    setEntryProctoringBridge({
      testId: '1',
      attempt: { id: 9 },
      service,
      handoffStatus: PROCTORING_HANDOFF.ENTRY,
    })

    assert.equal(shouldStopProctoringServiceOnRelease(service), true)
  })

  it('pending handoff must NOT stop on Entry unmount', () => {
    const service = fakeService()
    setEntryProctoringBridge({
      testId: '1',
      attempt: { id: 9 },
      service,
    })
    assert.equal(markEntryProctoringHandoffPending(), true)
    assert.equal(getEntryProctoringBridge('1').handoffStatus, PROCTORING_HANDOFF.PENDING)
    assert.equal(shouldStopProctoringServiceOnRelease(service), false)
  })

  it('adopted handoff must NOT stop on Attempt remount (Strict Mode)', () => {
    const service = fakeService()
    setEntryProctoringBridge({ testId: '1', attempt: { id: 9 }, service })
    markEntryProctoringHandoffPending()
    assert.equal(claimEntryProctoringHandoff(service), true)
    assert.equal(getEntryProctoringBridge('1').handoffStatus, PROCTORING_HANDOFF.ADOPTED)
    assert.equal(shouldStopProctoringServiceOnRelease(service), false)
  })

  it('clearing a pending (never adopted) handoff stops the orphan service', async () => {
    const service = fakeService()
    setEntryProctoringBridge({ testId: '1', attempt: { id: 9 }, service })
    markEntryProctoringHandoffPending()
    clearEntryProctoringBridge()
    assert.equal(service.stopped, true)
    assert.equal(getEntryProctoringBridge('1'), null)
  })

  it('clearing an adopted handoff does not double-stop a still-running service', () => {
    const service = fakeService()
    setEntryProctoringBridge({ testId: '1', attempt: { id: 9 }, service })
    markEntryProctoringHandoffPending()
    claimEntryProctoringHandoff(service)
    clearEntryProctoringBridge()
    assert.equal(service.stopped, false)
    assert.equal(getEntryProctoringBridge('1'), null)
  })

  it('Strict Mode remount skips deferred release; real leave stops', async () => {
    const service = fakeService()
    setEntryProctoringBridge({ testId: '1', attempt: { id: 9 }, service })
    markEntryProctoringHandoffPending()
    claimEntryProctoringHandoff(service)

    const gen1 = beginAttemptProctoringOwnership()
    let stoppedByRelease = false
    scheduleReleaseAttemptProctoring(gen1, {
      stop: async () => {
        stoppedByRelease = true
        await service.stop()
      },
    })


    const gen2 = beginAttemptProctoringOwnership()
    assert.notEqual(gen1, gen2)

    await new Promise((resolve) => queueMicrotask(resolve))
    assert.equal(stoppedByRelease, false)
    assert.equal(service.stopped, false)

    scheduleReleaseAttemptProctoring(gen2, {
      stop: async () => {
        stoppedByRelease = true
        await service.stop()
      },
    })
    await new Promise((resolve) => queueMicrotask(resolve))
    assert.equal(stoppedByRelease, true)
    assert.equal(service.stopped, true)
  })
})
