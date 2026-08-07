import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AnalyticsBestWeakSubjects from '../../components/analytics/AnalyticsBestWeakSubjects'
import AnalyticsEngagedSubjects from '../../components/analytics/AnalyticsEngagedSubjects'
import AnalyticsFilters from '../../components/analytics/AnalyticsFilters'
import AnalyticsInactiveStudents from '../../components/analytics/AnalyticsInactiveStudents'
import AnalyticsIntegrityPreview from '../../components/analytics/AnalyticsIntegrityPreview'
import AnalyticsMonthlyScoresChart from '../../components/analytics/AnalyticsMonthlyScoresChart'
import AnalyticsOverviewCards from '../../components/analytics/AnalyticsOverviewCards'
import AnalyticsPassFailChart from '../../components/analytics/AnalyticsPassFailChart'
import AnalyticsTeacherActivity from '../../components/analytics/AnalyticsTeacherActivity'
import AnalyticsTopStudents from '../../components/analytics/AnalyticsTopStudents'
import IntegrityReportReviewModal from '../../components/analytics/IntegrityReportReviewModal'
import { ROUTES } from '../../constants/routes'
import { useInstitutionAnalytics } from '../../hooks/analytics/useInstitutionAnalytics'
import {
  useIntegrityReportDetail,
  useIntegrityReportReview,
} from '../../hooks/analytics/useIntegrityReports'
import { tUI } from '../../lib/appToast'
import {
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { INTEGRITY_REPORT_STATUS } from '../../lib/integrityReportsModel'
import { useToastStore } from '../../store/toastStore'

function AnalyticsPage() {
  const { t } = useTranslation(['analytics', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const {
    canAccess,
    overview,
    passFail,
    monthlyScores,
    mostEngagedSubjects,
    bestSubjects,
    weakestSubjects,
    teacherActivity,
    topStudents,
    inactiveStudents,
    problematicExams,
    integrityPreview,
    subjects,
    teachers,
    datePreset,
    dateFrom,
    dateTo,
    subjectId,
    teacherMembershipId,
    setSubjectId,
    setTeacherMembershipId,
    setDateFrom,
    setDateTo,
    applyDatePreset,
    loading,
    error,
    refetch,
  } = useInstitutionAnalytics()

  const [selectedReportId, setSelectedReportId] = useState(null)
  const { report: selectedReport, loading: detailLoading } = useIntegrityReportDetail(selectedReportId)
  const { submitReview, submitting } = useIntegrityReportReview()

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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('title')}</h1>
          <p className={`mt-1.5 max-w-2xl ${shellPageSubtitleClass}`}>{t('subtitle')}</p>
        </div>
        <AnalyticsFilters
          subjects={subjects}
          teachers={teachers}
          subjectId={subjectId}
          teacherMembershipId={teacherMembershipId}
          datePreset={datePreset}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSubjectChange={setSubjectId}
          onTeacherChange={setTeacherMembershipId}
          onDatePresetChange={applyDatePreset}
          onDateFromChange={(value) => {
            applyDatePreset('custom')
            setDateFrom(value)
          }}
          onDateToChange={(value) => {
            applyDatePreset('custom')
            setDateTo(value)
          }}
          disabled={loading}
        />
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}{' '}
          <button type="button" className="underline" onClick={refetch}>
            {t('common:actions.retry')}
          </button>
        </div>
      ) : null}

      <AnalyticsOverviewCards overview={overview} loading={loading} />

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <AnalyticsPassFailChart passFail={passFail} loading={loading} />
        <AnalyticsMonthlyScoresChart monthlyScores={monthlyScores} loading={loading} />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <AnalyticsEngagedSubjects subjects={mostEngagedSubjects} loading={loading} />
        <AnalyticsBestWeakSubjects
          bestSubjects={bestSubjects}
          weakestSubjects={weakestSubjects}
          loading={loading}
        />
      </div>

      <AnalyticsTeacherActivity teachers={teacherActivity} loading={loading} />

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <AnalyticsIntegrityPreview
          problematicExams={problematicExams}
          integrityPreview={integrityPreview}
          loading={loading}
          onViewReport={(report) => setSelectedReportId(report.id)}
        />
        <div className="flex min-h-0 flex-col gap-4">
          <AnalyticsTopStudents students={topStudents} loading={loading} />
          <AnalyticsInactiveStudents students={inactiveStudents} loading={loading} />
        </div>
      </div>

      <IntegrityReportReviewModal
        open={Boolean(selectedReportId)}
        report={detailLoading ? { ...integrityPreview.find((r) => r.id === selectedReportId), id: selectedReportId } : selectedReport}
        submitting={submitting}
        onClose={() => setSelectedReportId(null)}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
      />
    </div>
  )
}

export default AnalyticsPage
