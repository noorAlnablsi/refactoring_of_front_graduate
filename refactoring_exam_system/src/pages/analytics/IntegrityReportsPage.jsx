import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IntegrityReportsTable from '../../components/analytics/IntegrityReportsTable'
import IntegrityReportReviewModal from '../../components/analytics/IntegrityReportReviewModal'
import { ROUTES } from '../../constants/routes'
import {
  useIntegrityReportDetail,
  useIntegrityReportReview,
  useIntegrityReportsList,
} from '../../hooks/analytics/useIntegrityReports'
import { tUI } from '../../lib/appToast'
import { INTEGRITY_REPORT_STATUS } from '../../lib/integrityReportsModel'
import {
  shellGhostButtonClass,
  shellInputClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { useToastStore } from '../../store/toastStore'

const selectClass = `h-11 ${shellInputClass} px-3 text-sm font-semibold`

function IntegrityReportsPage() {
  const { t } = useTranslation(['analytics', 'common'])
  const showToast = useToastStore((s) => s.showToast)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [page, setPage] = useState(1)
  const [selectedReportId, setSelectedReportId] = useState(null)

  const { canAccess, reports, total, pages, loading, error, subjects, refetch } =
    useIntegrityReportsList({
      page,
      perPage: 20,
      status,
      subjectId,
      search,
    })

  const { report: selectedReport, loading: detailLoading } =
    useIntegrityReportDetail(selectedReportId)
  const { submitReview, submitting } = useIntegrityReportReview()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  if (!canAccess) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleConfirm = async (note) => {
    try {
      await submitReview(selectedReportId, {
        status: INTEGRITY_REPORT_STATUS.CONFIRMED,
        review_note: note,
      })
      showToast(tUI('toasts.reviewSuccess', { ns: 'analytics' }))
      setSelectedReportId(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDismiss = async (note) => {
    try {
      await submitReview(selectedReportId, {
        status: INTEGRITY_REPORT_STATUS.DISMISSED,
        review_note: note,
      })
      showToast(tUI('toasts.reviewSuccess', { ns: 'analytics' }))
      setSelectedReportId(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.ANALYTICS}
          className="text-xs font-bold text-[var(--shell-accent)] hover:underline"
        >
          ← {t('title')}
        </Link>
        <h1 className={`mt-2 text-2xl md:text-[28px] ${shellPageTitleClass}`}>
          {t('integrity.pageTitle')}
        </h1>
        <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('integrity.pageSubtitle')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">
            {t('search')}
          </span>
          <input
            className={`h-11 w-full ${shellInputClass} px-3 text-sm`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`${t('integrity.student')} / ${t('integrity.test')}`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">
            {t('integrity.status')}
          </span>
          <select
            className={selectClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">{t('integrity.allStatuses')}</option>
            <option value={INTEGRITY_REPORT_STATUS.PENDING}>
              {t('integrity.statuses.PENDING')}
            </option>
            <option value={INTEGRITY_REPORT_STATUS.CONFIRMED}>
              {t('integrity.statuses.CONFIRMED')}
            </option>
            <option value={INTEGRITY_REPORT_STATUS.DISMISSED}>
              {t('integrity.statuses.DISMISSED')}
            </option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">
            {t('filters.subject')}
          </span>
          <select
            className={selectClass}
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              setPage(1)
            }}
          >
            <option value="">{t('filters.allSubjects')}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <IntegrityReportsTable
        reports={reports}
        loading={loading}
        onReview={(report) => setSelectedReportId(report.id)}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[var(--shell-text-muted)]">
          {total} · {page}/{pages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={shellGhostButtonClass}
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('common:actions.previous')}
          </button>
          <button
            type="button"
            className={shellGhostButtonClass}
            disabled={page >= pages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common:actions.next')}
          </button>
        </div>
      </div>

      <IntegrityReportReviewModal
        open={Boolean(selectedReportId)}
        report={
          detailLoading
            ? reports.find((r) => r.id === selectedReportId) || { id: selectedReportId }
            : selectedReport
        }
        submitting={submitting}
        onClose={() => setSelectedReportId(null)}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
      />
    </div>
  )
}

export default IntegrityReportsPage
