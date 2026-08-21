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
  extractMonitoringList,
  liveFeedToTimelineRows,
  normalizeMonitoringSnapshot,
} from '../../lib/proctoring/monitoringModel'
import { WebSocketManager } from '../../services/proctoring/WebSocketManager'
import {
  forceSubmitAttempt,
  getAttemptAuditLogs,
  getAttemptProctoringEvents,
  getAttemptProctoringViolations,
  getTestMonitoring,
  listTestAttempts,
} from '../../services/tests.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

const PING_INTERVAL_MS = 25_000
const MAX_FEED_EVENTS = 80

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
  const liveEventsRef = useRef([])

  const pushLiveEvent = useCallback((event) => {
    setLiveEvents((prev) => {
      let next = prev
      if (event.kind === 'row_update' && event.monitoringState) {
        const already = prev.some(
          (item) =>
            item.kind === 'row_update' &&
            item.studentMembershipId === event.studentMembershipId &&
            String(item.monitoringState || '').toUpperCase() ===
              String(event.monitoringState || '').toUpperCase(),
        )
        if (already) {
          liveEventsRef.current = prev
          return prev
        }
      }

      if (event.kind === 'violation' && event.id) {
        if (prev.some((item) => item.id === event.id)) {
          liveEventsRef.current = prev
          return prev
        }
      }

      next = [event, ...prev].slice(0, MAX_FEED_EVENTS)
      liveEventsRef.current = next
      return next
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
        const attemptId = message.attempt_id ?? violation.attempt_id ?? null
        patchStudents((rows) =>
          rows.map((row) => {
            if (row.studentMembershipId !== membershipId) return row
            return {
              ...row,
              attemptId: attemptId ?? row.attemptId,
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
          attemptId,
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

          loadSnapshot().catch(() => {})
        },
        onError: () => {

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
  }, [testId])

  const selectedStudent =
    snapshot?.students?.find((s) => s.studentMembershipId === selectedMembershipId) || null

  const openStudent = useCallback(
    async (membershipId) => {
      setSelectedMembershipId(membershipId)
      const student =
        studentsRef.current.find((s) => s.studentMembershipId === membershipId) || null

      const attemptIdFromFeed = liveEventsRef.current.find(
        (event) =>
          Number(event.studentMembershipId) === Number(membershipId) && event.attemptId,
      )?.attemptId

      let attemptId = student?.attemptId ?? attemptIdFromFeed ?? null

      if (!attemptId && testId) {
        try {
          const attemptsData = await listTestAttempts(testId)
          const attempts = attemptsData?.attempts || attemptsData?.items || []
          const matched = attempts
            .filter(
              (row) =>
                Number(row.student_membership_id ?? row.studentMembershipId) ===
                Number(membershipId),
            )
            .sort((a, b) => {
              const ta = Date.parse(a.submitted_at || a.started_at || a.created_at || 0) || 0
              const tb = Date.parse(b.submitted_at || b.started_at || b.created_at || 0) || 0
              return tb - ta
            })
          attemptId = matched[0]?.id ?? null
        } catch {
          attemptId = null
        }
      }

      if (attemptId && student && Number(student.attemptId) !== Number(attemptId)) {
        patchStudents((rows) =>
          rows.map((row) =>
            row.studentMembershipId === membershipId ? { ...row, attemptId } : row,
          ),
        )
      }

      const feedFallback = () => liveFeedToTimelineRows(liveEventsRef.current, membershipId)

      if (!attemptId) {
        setAuditLogs(feedFallback())
        return
      }

      setAuditLoading(true)
      try {
        const [auditData, eventsData, violationsData] = await Promise.all([
          getAttemptAuditLogs(testId, attemptId).catch(() => null),
          getAttemptProctoringEvents(testId, attemptId).catch(() => null),
          getAttemptProctoringViolations(testId, attemptId).catch(() => null),
        ])

        const logs = buildMonitoringTimeline({
          events: extractMonitoringList(eventsData, [
            'events',
            'items',
            'proctoring_events',
            'data',
          ]),
          violations: extractMonitoringList(violationsData, [
            'violations',
            'items',
            'proctoring_violations',
            'data',
          ]),
          auditLogs: extractMonitoringList(auditData, [
            'audit_logs',
            'items',
            'logs',
            'data',
          ]),
        })

        setAuditLogs(logs.length ? logs : feedFallback())
      } catch (err) {
        setAuditLogs(feedFallback())
        showToast(err?.message || String(err), 'error')
      } finally {
        setAuditLoading(false)
      }
    },
    [testId, showToast, patchStudents],
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
