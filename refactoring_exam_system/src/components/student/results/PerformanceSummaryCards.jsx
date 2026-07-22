import { useTranslation } from 'react-i18next'
import { ClipboardList, LineChart, Trophy } from 'lucide-react'

const CARD_CLASS =
  'relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl bg-[var(--shell-surface)] shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)]'

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`
}

function PerformanceStatCard({ label, children, icon: Icon, iconBg, accentClassName }) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <div className="mt-auto text-start">
          <p className="text-[13px] font-medium leading-5 text-[var(--shell-text-muted)]">{label}</p>
          <div className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-[var(--shell-text)]">
            {children}
          </div>
        </div>
      </div>
      <div className={`h-1 w-full shrink-0 ${accentClassName}`} aria-hidden="true" />
    </div>
  )
}

function PerformanceSummaryCards({ summary, loading }) {
  const { t } = useTranslation('student')

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className={`${CARD_CLASS} shell-skeleton min-h-[120px] animate-pulse`}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  const improvement =
    summary?.subjectsNeedingImprovement?.length > 0
      ? summary.subjectsNeedingImprovement.join('، ')
      : t('performance.summary.noImprovementSubjects')

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <PerformanceStatCard
        label={t('performance.summary.average')}
        icon={LineChart}
        iconBg="bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]"
        accentClassName="bg-[var(--shell-accent)]"
      >
        {formatPercent(summary?.averageScore)}
      </PerformanceStatCard>

      <PerformanceStatCard
        label={t('performance.summary.highest')}
        icon={Trophy}
        iconBg="bg-[var(--shell-info-bg)] text-[var(--shell-info-text)]"
        accentClassName="bg-[var(--shell-info-text)]"
      >
        {formatPercent(summary?.highestScore)}
      </PerformanceStatCard>

      <PerformanceStatCard
        label={t('performance.summary.needsImprovement')}
        icon={ClipboardList}
        iconBg="bg-[var(--shell-danger-bg)] text-[var(--shell-danger-text)]"
        accentClassName="bg-[var(--shell-danger-text)]"
      >
        <p className="line-clamp-2 text-base font-extrabold leading-6 text-[var(--shell-text)]">
          {improvement}
        </p>
      </PerformanceStatCard>
    </div>
  )
}

export default PerformanceSummaryCards
