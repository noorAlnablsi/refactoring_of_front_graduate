import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PROCTORING_CONNECTION_STATE,
  PROCTORING_MONITOR_INCOMING,
} from '../../constants/proctoring'
import { ensureValidAccessToken } from '../../lib/authSession'
import { getWorkspaceId } from '../../lib/workspaceContext'
import { buildTeacherMonitorWebSocketUrl } from '../../lib/proctoring/wsUrl'
import {
  applyStudentRowChanges,
  buildMonitoringTimeline,
  computeMonitoringStatsFromStudents,
  normalizeMonitoringSnapshot,
} from '../../lib/proctoring/monitoringModel'
import { WebSocketManager } from '../../services/proctoring/WebSocketManager'
import {
  forceSubmitAttempt,
  getAttemptAuditLogs,
  getAttemptProctoringEvents,
  getAttemptProctoringViolations,
  getTestMonitoring,
} from '../../services/tests.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

const PING_INTERVAL_MS = 25_000
const MAX_FEED_EVENTS = 80

/**
 * Teacher live monitoring: REST snapshot is source of truth; WS applies deltas.
 * On reconnect → re-fetch GET /monitoring (backend contract).
 */
export function useExamLiveMonitoring(testId) {
  const showToast = useToastStore((s) => s.showToast)
  const [loading, setLoading] = useState(true)
  const [snapshot, setSnapshot] = useState(null)
  const [connectionState, setConnectionState] = useState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
  const [liveEvents, setLiveEvents] = useState([])
  const [selectedMembershipId, setSelectedMembershipId] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [forcing, setForcing] = useState(false)
  const [error, setError] = useState(null)

  const wsRef = useRef(null)
  const pingRef = useRef(null)
  const studentsRef = useRef([])

  const pushLiveEvent = useCallback((event) => {
    setLiveEvents((prev) => {
      if (event.kind === 'row_update' && event.monitoringState) {
        const already = prev.some(
          (item) =>
            item.kind === 'row_update' &&
            item.studentMembershipId === event.studentMembershipId &&
            String(item.monitoringState || '').toUpperCase() ===
              String(event.monitoringState || '').toUpperCase(),
        )
        if (already) return prev
      }

      if (event.kind === 'violation' && event.id) {
        if (prev.some((item) => item.id === event.id)) return prev
      }

      return [event, ...prev].slice(0, MAX_FEED_EVENTS)
    })
  }, [])

  const patchStudents = useCallback((updater) => {
    setSnapshot((prev) => {
      if (!prev) return prev
      const students = updater(prev.students)
      studentsRef.current = students
      const rowStats = computeMonitoringStatsFromStudents(students)
      return {
        ...prev,
        students,
        stats: {
          ...prev.stats,
          ...rowStats,
          totalAssigned: prev.stats?.totalAssigned || students.length,
        },
      }
    })
  }, [])

  const loadSnapshot = useCallback(async () => {
    if (!testId) return null
    const data = await getTestMonitoring(testId)
    const normalized = normalizeMonitoringSnapshot(data)
    studentsRef.current = normalized.students
    setSnapshot(normalized)
    return normalized
  }, [testId])

  const reload = useCallback(async () => {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      await loadSnapshot()
    } catch (err) {
      setError(err?.message || String(err))
      showToast(err?.message || String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [testId, loadSnapshot, showToast])

  const handleMonitorMessage = useCallback(
    (message) => {
      if (!message || typeof message !== 'object') return
      const type = message.type

      if (type === PROCTORING_MONITOR_INCOMING.SUBSCRIBED) {
        return
      }

      if (type === PROCTORING_MONITOR_INCOMING.PONG) {
        return
      }

      if (type === PROCTORING_MONITOR_INCOMING.STUDENT_ROW_UPDATED) {
        const membershipId = message.student_membership_id
        const changes = message.changes || {}
        patchStudents((rows) =>
          rows.map((row) =>
            row.studentMembershipId === membershipId
              ? applyStudentRowChanges(row, changes)
              : row,
          ),
        )
        pushLiveEvent({
          id: `row-${membershipId}-${changes.monitoring_state || 'upd'}-${message.attempt_id || ''}`,
          kind: 'row_update',
          studentMembershipId: membershipId,
          attemptId: message.attempt_id ?? changes.attempt_id ?? null,
          monitoringState: changes.monitoring_state || null,
          createdAt: new Date().toISOString(),
          labelKey: 'monitoring.feed.rowUpdated',
        })
        return
      }

      if (type === PROCTORING_MONITOR_INCOMING.VIOLATION_CREATED) {
        const violation = message.violation || {}
        const membershipId = message.student_membership_id
        patchStudents((rows) =>
          rows.map((row) => {
            if (row.studentMembershipId !== membershipId) return row
            return {
              ...row,
              violationCount: (Number(row.violationCount) || 0) + 1,
              eventCount: (Number(row.eventCount) || 0) + 1,
              lastActivityAt: new Date().toISOString(),
            }
          }),
        )
        pushLiveEvent({
          id: `viol-${violation.id || `${membershipId}-${violation.violation_type}-${Date.now()}`}`,
          kind: 'violation',
          studentMembershipId: membershipId,
          attemptId: message.attempt_id ?? null,
          violationType: violation.violation_type || violation.type || 'VIOLATION',
          severity: violation.severity || null,
          createdAt: new Date().toISOString(),
          labelKey: 'monitoring.feed.violation',
        })
      }
    },
    [pushLiveEvent, patchStudents],
  )

  const disconnectWs = useCallback(() => {
    if (pingRef.current) {
      clearInterval(pingRef.current)
      pingRef.current = null
    }
    wsRef.current?.destroy?.()
    wsRef.current = null
    setConnectionState(PROCTORING_CONNECTION_STATE.CLOSED)
  }, [])

  const connectWs = useCallback(async () => {
    if (!testId) return
    disconnectWs()

    try {
      const token = await ensureValidAccessToken()
      const workspaceId = getWorkspaceId()
      const url = buildTeacherMonitorWebSocketUrl({ testId, token, workspaceId })

      const manager = new WebSocketManager({
        url,
        onStateChange: setConnectionState,
        onMessage: handleMonitorMessage,
        onOpen: () => {
          // Backend: after reconnect, re-fetch REST snapshot.
          loadSnapshot().catch(() => {})
        },
        onError: () => {
          // surfaced via connection state
        },
      })

      wsRef.current = manager
      manager.connect({ reconnect: true })

      pingRef.current = setInterval(() => {
        manager.send?.('ping', {})
      }, PING_INTERVAL_MS)
    } catch (err) {
      setConnectionState(PROCTORING_CONNECTION_STATE.DISCONNECTED)
      showToast(err?.message || String(err), 'error')
    }
  }, [testId, disconnectWs, handleMonitorMessage, loadSnapshot, showToast])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await reload()
      if (!cancelled) await connectWs()
    })()

    return () => {
      cancelled = true
      disconnectWs()
    }
  }, [testId]) // eslint-disable-line react-hooks/exhaustive-deps -- mount per testId only

  const selectedStudent =
    snapshot?.students?.find((s) => s.studentMembershipId === selectedMembershipId) || null

  const openStudent = useCallback(
    async (membershipId) => {
      setSelectedMembershipId(membershipId)
      const student =
        studentsRef.current.find((s) => s.studentMembershipId === membershipId) || null
      if (!student?.attemptId) {
        setAuditLogs([])
        return
      }

      setAuditLoading(true)
      try {
        const [auditData, eventsData, violationsData] = await Promise.all([
          getAttemptAuditLogs(testId, student.attemptId).catch(() => ({ audit_logs: [] })),
          getAttemptProctoringEvents(testId, student.attemptId).catch(() => ({ events: [] })),
          getAttemptProctoringViolations(testId, student.attemptId).catch(() => ({
            violations: [],
          })),
        ])

        const logs = buildMonitoringTimeline({
          events: eventsData?.events || eventsData?.items || [],
          violations: violationsData?.violations || violationsData?.items || [],
          auditLogs: auditData?.audit_logs || auditData?.items || [],
        })
        setAuditLogs(logs)
      } catch (err) {
        setAuditLogs([])
        showToast(err?.message || String(err), 'error')
      } finally {
        setAuditLoading(false)
      }
    },
    [testId, showToast],
  )

  const closeStudent = useCallback(() => {
    setSelectedMembershipId(null)
    setAuditLogs([])
  }, [])

  const handleForceSubmit = useCallback(async () => {
    if (!testId || !selectedStudent?.attemptId) return

    setForcing(true)
    try {
      await forceSubmitAttempt(testId, selectedStudent.attemptId)
      showAppToast('monitoring.forceSubmit.success', 'success', { ns: 'exams' })
      await loadSnapshot()
    } catch (err) {
      showToast(err?.message || String(err), 'error')
    } finally {
      setForcing(false)
    }
  }, [testId, selectedStudent, loadSnapshot, showToast])

  return {
    loading,
    error,
    snapshot,
    connectionState,
    liveEvents,
    selectedStudent,
    auditLogs,
    auditLoading,
    forcing,
    reload,
    openStudent,
    closeStudent,
    handleForceSubmit,
  }
}

export default useExamLiveMonitoring
