import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import {
  formatAnalyticsCount,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import { shellBodyTextClass, shellCardClass, shellSectionTitleClass } from '../../lib/shellUi'

const PASS_COLOR = 'var(--shell-accent)'
const FAIL_COLOR = '#fb7185'

function AnalyticsPassFailChart({ passFail, loading }) {
  const { t } = useTranslation('analytics')
  const passed = passFail?.passed_attempts ?? 0
  const failed = passFail?.failed_attempts ?? 0
  const passRate = passFail?.pass_rate ?? 0
  const total = passed + failed

  const data =
    total > 0
      ? [
          { name: 'pass', value: passed, color: PASS_COLOR },
          { name: 'fail', value: failed, color: FAIL_COLOR },
        ]
      : [{ name: 'empty', value: 1, color: 'var(--shell-border)' }]

  return (
    <section className={`flex h-full flex-col p-5 ${shellCardClass}`}>
      <h2 className={shellSectionTitleClass}>{t('passFail.title')}</h2>

      {loading ? (
        <div className="shell-skeleton mt-6 h-56 animate-pulse rounded-xl" />
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-48 w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius="68%"
                  outerRadius="92%"
                  paddingAngle={total > 0 ? 2 : 0}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-center text-lg font-extrabold text-[var(--shell-accent)]">
                {t('passFail.passCenter', { rate: formatAnalyticsPercent(passRate) })}
              </p>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-xl bg-emerald-50 px-3 py-3 text-center">
              <p className="text-sm font-extrabold text-emerald-700">
                {formatAnalyticsCount(passed)}
              </p>
              <p className={`mt-1 text-xs font-semibold ${shellBodyTextClass}`}>
                {t('passFail.passed')}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-3 text-center">
              <p className="text-sm font-extrabold text-rose-600">
                {formatAnalyticsCount(failed)}
              </p>
              <p className={`mt-1 text-xs font-semibold ${shellBodyTextClass}`}>
                {t('passFail.failed')}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default AnalyticsPassFailChart
