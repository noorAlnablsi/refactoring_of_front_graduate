import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatAnalyticsCount, formatAnalyticsPercent } from '../../lib/institutionAnalyticsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function AnalyticsMonthlyScoresChart({ monthlyScores = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`flex h-full flex-col p-5 ${shellCardClass}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className={`min-w-0 ${shellSectionTitleClass}`}>{t('monthly.title')}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--shell-accent)]" />
          <span className={`text-xs font-semibold ${shellSubtleTextClass}`}>
            {t('monthly.legend')}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="shell-skeleton mt-6 h-56 animate-pulse rounded-xl" />
      ) : monthlyScores.length === 0 ? (
        <p className={`mt-10 text-sm ${shellBodyTextClass}`}>{t('empty')}</p>
      ) : (
        <div className="mt-4 h-56 w-full min-h-[14rem] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyScores} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--shell-border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--shell-text-subtle)', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={32}
                tick={{ fill: 'var(--shell-text-subtle)', fontSize: 11 }}
                tickFormatter={(value) => formatAnalyticsCount(value)}
              />
              <Tooltip
                cursor={{ fill: 'var(--shell-hover)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--shell-border)',
                  background: 'var(--shell-surface)',
                  boxShadow: 'var(--shell-shadow-sm)',
                }}
                formatter={(value) => [formatAnalyticsPercent(value), t('monthly.legend')]}
              />
              <Bar
                dataKey="average_score"
                fill="var(--shell-accent)"
                radius={[8, 8, 4, 4]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default AnalyticsMonthlyScoresChart
