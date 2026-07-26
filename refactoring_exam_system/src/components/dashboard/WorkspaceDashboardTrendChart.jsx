import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildTrendChartPoints,
  formatAverageScorePercent,
  formatTrendChangePercent,
} from '../../lib/workspaceDashboardModel'
import { shellBodyTextClass, shellCardClass, shellSectionTitleClass, shellSubtleTextClass } from '../../lib/shellUi'

function pickAxisLabels(points) {
  if (points.length <= 7) return points
  const lastIndex = points.length - 1
  const indexes = new Set([0, lastIndex])
  for (let i = 1; i <= 5; i += 1) {
    indexes.add(Math.round((i / 6) * lastIndex))
  }
  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => points[index])
    .filter(Boolean)
}

function WorkspaceDashboardTrendChart({ trend, averageScore, loading }) {
  const { t } = useTranslation('dashboard')
  const width = 360
  const height = 132

  const chart = useMemo(
    () => buildTrendChartPoints(trend?.data || [], width, height, 14),
    [trend?.data],
  )

  const axisLabels = useMemo(() => pickAxisLabels(chart.points), [chart.points])
  const changeLabel = formatTrendChangePercent(chart.changePercent)
  const changePositive = chart.changePercent != null && chart.changePercent > 0
  const changeNegative = chart.changePercent != null && chart.changePercent < 0

  return (
    <section className={`flex h-full flex-col p-5 ${shellCardClass}`}>
      <div>
        <h2 className={shellSectionTitleClass}>{t('trend.title')}</h2>
        <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>{t('trend.subtitle')}</p>
      </div>

      {loading ? (
        <div className="shell-skeleton mt-6 h-40 animate-pulse rounded-xl" />
      ) : chart.points.length === 0 ? (
        <p className={`mt-8 text-sm ${shellBodyTextClass}`}>{t('trend.empty')}</p>
      ) : (
        <div className="mt-4 flex-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-32 w-full"
            role="img"
            aria-label={t('trend.title')}
          >
            <defs>
              <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--shell-accent)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--shell-accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={chart.areaPath} fill="url(#dashboardTrendFill)" />
            <path
              d={chart.linePath}
              fill="none"
              stroke="var(--shell-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {chart.points.map((point) => (
              <circle
                key={`${point.date}-${point.value}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="var(--shell-surface)"
                stroke="var(--shell-accent)"
                strokeWidth="2"
              />
            ))}
          </svg>

          <div className="mt-2 flex justify-between gap-1 px-0.5">
            {axisLabels.map((point) => (
              <span
                key={`label-${point.date}`}
                className={`min-w-0 flex-1 truncate text-center text-[10px] font-medium ${shellSubtleTextClass}`}
              >
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-[var(--shell-border)] pt-4">
        {changeLabel ? (
          <p
            className={`text-2xl font-extrabold tracking-tight ${
              changePositive
                ? 'text-emerald-500'
                : changeNegative
                  ? 'text-rose-500'
                  : 'text-[var(--shell-accent)]'
            }`}
          >
            {changeLabel}
          </p>
        ) : (
          <>
            <p className={`text-xs ${shellSubtleTextClass}`}>{t('trend.averageLabel')}</p>
            <p className="mt-1 text-lg font-extrabold text-[var(--shell-accent)]">
              {formatAverageScorePercent(averageScore)}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export default WorkspaceDashboardTrendChart
