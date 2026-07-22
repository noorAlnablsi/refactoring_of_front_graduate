import { useTranslation } from 'react-i18next'
import ExamResultsTable from '../../components/student/results/ExamResultsTable'
import PerformanceSummaryCards from '../../components/student/results/PerformanceSummaryCards'
import { useStudentPerformance } from '../../hooks/student/useStudentPerformance'
import { useToastStore } from '../../store/toastStore'

function StudentPerformancePage() {
  const { t } = useTranslation('student')
  const showToast = useToastStore((s) => s.showToast)
  const {
    loading,
    error,
    summary,
    rows,
    page,
    totalPages,
    total,
    perPage,
    sortBy,
    refetch,
    onSortCycle,
    onPageChange,
  } = useStudentPerformance()

  if (error && !loading && total === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-semibold text-[var(--shell-danger-text)]">{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-[var(--shell-accent-contrast)]"
        >
          {t('performance.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="text-start">
        <h1 className="text-2xl font-extrabold text-[var(--shell-text)] md:text-3xl">
          {t('performance.title')}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--shell-text-muted)]">
          {t('performance.subtitle')}
        </p>
      </header>

      <PerformanceSummaryCards summary={summary} loading={loading} />

      <ExamResultsTable
        rows={rows}
        loading={loading}
        total={total}
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onSort={onSortCycle}
        sortBy={sortBy}
        onExport={() => showToast(t('performance.exportUnavailable'), 'error')}
      />
    </div>
  )
}

export default StudentPerformancePage
