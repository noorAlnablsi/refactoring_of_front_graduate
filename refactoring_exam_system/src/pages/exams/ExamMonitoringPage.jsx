import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowRight, Radio, RefreshCw, ShieldAlert, X } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { PROCTORING_CONNECTION_STATE } from '../../constants/proctoring'
import { MONITORING_STATE, formatMonitoringTimestamp, normalizeMonitoringEventKey, resolveMonitoringLogMessage } from '../../lib/proctoring/monitoringModel'
import { useExamLiveMonitoring } from '../../hooks/exams/useExamLiveMonitoring'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function translateEventType(t, eventType) {
  const key = normalizeMonitoringEventKey(eventType)
  if (!key) return '—'
  return t(`monitoring.eventTypes.${key}`, { defaultValue: key.replace(/_/g, ' ') })
}

function translateSeverity(t, severity) {
  const key = normalizeMonitoringEventKey(severity)
  if (!key) return null
  return t(`monitoring.severity.${key}`, { defaultValue: key })
}

function translateMonitoringState(t, state) {
  const key = normalizeMonitoringEventKey(state)
  if (!key) return '—'
  return t(`monitoring.state.${key}`, { defaultValue: key })
}

function stateBadgeClass(state) {
  if (state === MONITORING_STATE.IN_PROGRESS) return 'bg-[#E8F7F6] text-[#2AA8A2]'
  if (state === MONITORING_STATE.PROCTORING_AUTO_TERMINATED) return 'bg-[#FEE2E2] text-[#DC2626]'
  if (state === MONITORING_STATE.FORCE_SUBMITTED) return 'bg-[#FEF3C7] text-[#B45309]'
  if (state === MONITORING_STATE.TIMED_OUT) return 'bg-[#EEF2FF] text-[#4F46E5]'
  if (state === MONITORING_STATE.SUBMITTED || state === MONITORING_STATE.COMPLETED) {
    return 'bg-[#F1F5F9] text-[#64748B]'
  }
  return 'bg-[#F8FAFB] text-[#94A3B8]'
}

function connectionLabel(state, t) {
  if (state === PROCTORING_CONNECTION_STATE.CONNECTED || state === PROCTORING_CONNECTION_STATE.SESSION_ACTIVE) {
    return t('monitoring.connection.connected')
  }
  if (state === PROCTORING_CONNECTION_STATE.CONNECTING) return t('monitoring.connection.connecting')
  return t('monitoring.connection.disconnected')
}

function ExamMonitoringPage() {
  const { id: testId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('exams')
  const {
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
  } = useExamLiveMonitoring(testId)

  const studentNameById = useMemo(() => {
    const map = new Map()
    ;(snapshot?.students || []).forEach((s) => {
      map.set(s.studentMembershipId, s.fullName)
    })
    return map
  }, [snapshot])

  const stats = snapshot?.stats

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('monitoring.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>
            {snapshot?.name || t('monitoring.title')}
          </h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>{t('monitoring.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F6F8F9] px-3 py-1.5 text-xs font-bold text-[#64748B]">
            <Radio className="h-3.5 w-3.5 text-[#2AA8A2]" />
            {connectionLabel(connectionState, t)}
          </span>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-4 py-2.5 text-sm font-bold text-[#64748B]"
          >
            <RefreshCw className="h-4 w-4" />
            {t('monitoring.refresh')}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXAMS)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-4 py-2.5 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('monitoring.backToExams')}
          </button>
        </div>
      </header>

      {loading ? (
        <p className={`text-sm ${shellSubtleTextClass}`}>{t('monitoring.loading')}</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('monitoring.stats.assigned')} value={stats?.totalAssigned} />
            <StatCard label={t('monitoring.stats.inProgress')} value={stats?.inProgress} highlight />
            <StatCard label={t('monitoring.stats.submitted')} value={stats?.submitted} />
            <StatCard
              label={t('monitoring.stats.autoTerminated')}
              value={stats?.proctoringAutoTerminated}
              danger
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className={`overflow-hidden ${shellCardClass}`}>
              <div className="flex items-center gap-2 border-b border-[#E5E9EB] px-5 py-4">
                <Activity className="h-5 w-5 text-[#2AA8A2]" />
                <h2 className="text-sm font-extrabold text-[#2A3433]">{t('monitoring.studentsTitle')}</h2>
              </div>
              {(snapshot?.students || []).length === 0 ? (
                <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('monitoring.emptyStudents')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-right text-sm">
                    <thead className="bg-[#F8FAFB] text-xs font-bold text-[#94A3B8]">
                      <tr>
                        <th className="px-4 py-3">{t('monitoring.columns.student')}</th>
                        <th className="px-4 py-3">{t('monitoring.columns.state')}</th>
                        <th className="px-4 py-3">{t('monitoring.columns.risk')}</th>
                        <th className="px-4 py-3">{t('monitoring.columns.violations')}</th>
                        <th className="px-4 py-3">{t('monitoring.columns.events')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.students.map((row) => (
                        <tr
                          key={row.studentMembershipId}
                          className={`cursor-pointer border-t border-[#EEF2F4] transition hover:bg-[#F8FDFC] ${
                            selectedStudent?.studentMembershipId === row.studentMembershipId
                              ? 'bg-[#F8FDFC]'
                              : ''
                          }`}
                          onClick={() => openStudent(row.studentMembershipId)}
                        >
                          <td className="px-4 py-3 font-bold text-[#2A3433]">{row.fullName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${stateBadgeClass(row.monitoringState)}`}
                            >
                              {t(`monitoring.state.${row.monitoringState}`, {
                                defaultValue: row.monitoringState,
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#64748B]">
                            {formatLocaleNumber(row.riskPercentage)}%
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#64748B]">
                            {formatLocaleNumber(row.violationCount)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#64748B]">
                            {formatLocaleNumber(row.eventCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className={`overflow-hidden ${shellCardClass}`}>
              <div className="flex items-center gap-2 border-b border-[#E5E9EB] px-5 py-4">
                <ShieldAlert className="h-5 w-5 text-[#2AA8A2]" />
                <h2 className="text-sm font-extrabold text-[#2A3433]">{t('monitoring.feedTitle')}</h2>
              </div>
              {liveEvents.length === 0 ? (
                <p className={`px-5 py-8 text-sm ${shellSubtleTextClass}`}>{t('monitoring.feedEmpty')}</p>
              ) : (
                <ul className="max-h-[420px] space-y-2 overflow-y-auto p-4">
                  {liveEvents.map((event) => {
                    const name =
                      studentNameById.get(event.studentMembershipId) ||
                      `#${formatLocaleNumber(event.studentMembershipId)}`
                    return (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => openStudent(event.studentMembershipId)}
                          className="w-full rounded-xl border border-[#E5E9EB] bg-[#FAFBFC] px-4 py-3 text-right transition hover:border-[#2AA8A2] hover:bg-[#F8FDFC]"
                        >
                          <p className="text-sm font-bold text-[#2A3433]">{name}</p>
                          <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>
                            {event.kind === 'violation'
                              ? t('monitoring.feed.violationLine', {
                                  type: translateEventType(t, event.violationType),
                                  severity:
                                    translateSeverity(t, event.severity) || '—',
                                })
                              : t('monitoring.feed.rowUpdatedLine', {
                                  state: translateMonitoringState(
                                    t,
                                    event.monitoringState,
                                  ),
                                })}
                          </p>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {selectedStudent ? (
        <aside className="fixed inset-y-0 left-0 z-40 w-full max-w-md overflow-y-auto bg-white p-6 shadow-[-8px_0_30px_rgba(15,23,42,0.12)] ring-1 ring-[#E5E9EB]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={shellPageEyebrowClass}>{t('monitoring.detail.eyebrow')}</p>
              <h3 className={`mt-2 text-xl ${shellPageTitleClass}`}>{selectedStudent.fullName}</h3>
            </div>
            <button
              type="button"
              onClick={closeStudent}
              className="rounded-lg p-2 text-[#64748B] hover:bg-[#F6F8F9]"
              aria-label={t('monitoring.detail.close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <DetailStat
              label={t('monitoring.detail.state')}
              value={t(`monitoring.state.${selectedStudent.monitoringState}`, {
                defaultValue: selectedStudent.monitoringState,
              })}
            />
            <DetailStat
              label={t('monitoring.detail.risk')}
              value={`${formatLocaleNumber(selectedStudent.riskPercentage)}%`}
            />
            <DetailStat
              label={t('monitoring.detail.violations')}
              value={formatLocaleNumber(selectedStudent.violationCount)}
            />
            <DetailStat
              label={t('monitoring.detail.events')}
              value={formatLocaleNumber(selectedStudent.eventCount)}
            />
          </dl>

          {selectedStudent.submissionSource ? (
            <p className={`mt-4 text-xs ${shellSubtleTextClass}`}>
              {t('monitoring.detail.source')}:{' '}
              {t(`grading.submissionSource.${selectedStudent.submissionSource}`, {
                defaultValue: selectedStudent.submissionSource,
              })}
            </p>
          ) : null}

          {selectedStudent.monitoringState === MONITORING_STATE.IN_PROGRESS &&
          selectedStudent.attemptId ? (
            <button
              type="button"
              disabled={forcing}
              onClick={() => {
                if (!window.confirm(t('monitoring.forceSubmit.confirm'))) return
                handleForceSubmit()
              }}
              className="mt-5 w-full rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm font-bold text-[#DC2626] disabled:opacity-60"
            >
              {forcing ? t('monitoring.forceSubmit.working') : t('monitoring.forceSubmit.action')}
            </button>
          ) : null}

          {selectedStudent.attemptId ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.EXAM_ATTEMPT_GRADE.replace(':id', testId).replace(
                    ':attemptId',
                    String(selectedStudent.attemptId),
                  ),
                )
              }
              className={`mt-3 w-full ${shellAccentButtonClass} justify-center px-4 py-3 text-sm`}
            >
              {t('monitoring.detail.openGrading')}
            </button>
          ) : null}

          <div className="mt-6">
            <h4 className="text-sm font-extrabold text-[#2A3433]">{t('monitoring.detail.auditTitle')}</h4>
            {auditLoading ? (
              <p className={`mt-3 text-sm ${shellSubtleTextClass}`}>{t('monitoring.detail.auditLoading')}</p>
            ) : auditLogs.length === 0 ? (
              <p className={`mt-3 text-sm ${shellSubtleTextClass}`}>{t('monitoring.detail.auditEmpty')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {auditLogs.map((log) => {
                  const displayMessage = resolveMonitoringLogMessage(
                    t,
                    log,
                    i18n.language,
                  )
                  const severityLabel = translateSeverity(t, log.severity)
                  return (
                  <li
                    key={`${log.kind || 'log'}-${log.id}`}
                    className="rounded-xl border border-[#E5E9EB] bg-[#F8FAFB] px-3 py-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[#2A3433]">
                        {translateEventType(t, log.eventType)}
                      </p>
                      {log.kind === 'violation' ? (
                        <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                          {t('monitoring.detail.violationBadge')}
                        </span>
                      ) : null}
                      {log.kind === 'event' ? (
                        <span className="rounded-full bg-[#E8F7F6] px-2 py-0.5 text-[10px] font-bold text-[#2AA8A2]">
                          {t('monitoring.detail.eventBadge')}
                        </span>
                      ) : null}
                      {log.kind === 'audit' ? (
                        <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#4F46E5]">
                          {t('monitoring.detail.auditBadge')}
                        </span>
                      ) : null}
                    </div>
                    {severityLabel ? (
                      <p className="mt-1 text-[#B45309]">{severityLabel}</p>
                    ) : null}
                    {displayMessage ? (
                      <p className={`mt-1 ${shellSubtleTextClass}`}>{displayMessage}</p>
                    ) : null}
                    {log.createdAt ? (
                      <p className={`mt-1 ${shellSubtleTextClass}`}>
                        {formatMonitoringTimestamp(log.createdAt, i18n.language)}
                      </p>
                    ) : null}
                  </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      ) : null}
    </div>
  )
}

function StatCard({ label, value, highlight = false, danger = false }) {
  return (
    <div className={`p-4 ${shellCardClass}`}>
      <p className="text-xs font-semibold text-[#94A3B8]">{label}</p>
      <p
        className={`mt-2 text-xl font-extrabold ${
          danger ? 'text-[#DC2626]' : highlight ? 'text-[#2AA8A2]' : 'text-[#2A3433]'
        }`}
      >
        {formatLocaleNumber(value ?? 0)}
      </p>
    </div>
  )
}

function DetailStat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F6F8F9] p-3">
      <dt className="text-[11px] font-semibold text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 text-sm font-extrabold text-[#2A3433]">{value}</dd>
    </div>
  )
}

export default ExamMonitoringPage
