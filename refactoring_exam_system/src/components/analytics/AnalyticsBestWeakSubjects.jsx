import { useTranslation } from 'react-i18next'
import { formatAnalyticsPercent } from '../../lib/institutionAnalyticsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
} from '../../lib/shellUi'

function RankList({ items, tone }) {
  const badge =
    tone === 'best'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-rose-50 text-rose-600'

  if (!items.length) return null

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={`${tone}-${item.subject_id ?? item.subject_name}`}
          className="flex items-center justify-between gap-3"
        >
          <span className="truncate text-sm font-bold text-[var(--shell-text)]">
            {item.subject_name}
          </span>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${badge}`}>
            {formatAnalyticsPercent(item.average_score)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function AnalyticsBestWeakSubjects({ bestSubjects = [], weakestSubjects = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`p-5 ${shellCardClass}`}>
      <h2 className={shellSectionTitleClass}>{t('rankedSubjects.title')}</h2>

      {loading ? (
        <div className="shell-skeleton mt-5 h-40 animate-pulse rounded-xl" />
      ) : !bestSubjects.length && !weakestSubjects.length ? (
        <p className={`mt-6 text-sm ${shellBodyTextClass}`}>{t('empty')}</p>
      ) : (
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-extrabold text-emerald-600">
              {t('rankedSubjects.best')}
            </p>
            <RankList items={bestSubjects} tone="best" />
          </div>
          <div>
            <p className="mb-3 text-xs font-extrabold text-rose-600">
              {t('rankedSubjects.worst')}
            </p>
            <RankList items={weakestSubjects} tone="worst" />
          </div>
        </div>
      )}
    </section>
  )
}

export default AnalyticsBestWeakSubjects
