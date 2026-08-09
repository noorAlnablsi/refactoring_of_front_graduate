import { useTranslation } from 'react-i18next'
import {
  formatAnalyticsCount,
  formatAnalyticsDate,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import { isIntegrityReportPending } from '../../lib/integrityReportsModel'
import {
  shellAccentSoftButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function StatusBadge({ status }) {
  const { t } = useTranslation('analytics')
  const tone =
    status === 'CONFIRMED'
      ? 'bg-rose-50 text-rose-600'
      : status === 'DISMISSED'
        ? 'bg-[var(--shell-hover)] text-[var(--shell-text-muted)]'
        : 'bg-amber-50 text-amber-700'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {t(`integrity.statuses.${status}`, { defaultValue: status })}
    </span>
  )
}

function IntegrityReportsTable({ reports = [], loading, onReview }) {
  const { t } = useTranslation('analytics')

  if (loading) {
    return <div className={`shell-skeleton h-64 animate-pulse ${shellCardClass}`} />
  }

  if (!reports.length) {
    return (
      <div className={`p-8 text-center ${shellCardClass}`}>
        <p className={shellBodyTextClass}>{t('integrity.empty')}</p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${shellCardClass}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className={`border-b border-[var(--shell-border)] text-xs ${shellSubtleTextClass}`}>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.student')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.test')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.subject')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.detail.risk')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.violations')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.status')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.createdAt')}</th>
            <th className="px-4 py-3 text-start font-bold">{t('integrity.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b border-[var(--shell-border)]/70 last:border-0">
              <td className="px-4 py-3 font-bold text-[var(--shell-text)]">{report.student_name}</td>
              <td className={`px-4 py-3 ${shellBodyTextClass}`}>{report.test_name}</td>
              <td className={`px-4 py-3 ${shellBodyTextClass}`}>{report.subject_name}</td>
              <td className="px-4 py-3 font-bold text-rose-600">
                {formatAnalyticsPercent(report.risk_percentage)}
              </td>
              <td className={`px-4 py-3 ${shellBodyTextClass}`}>
                {formatAnalyticsCount(report.violations_count)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={report.status} />
              </td>
              <td className={`px-4 py-3 ${shellBodyTextClass}`}>
                {formatAnalyticsDate(report.created_at || report.submitted_at)}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className={shellAccentSoftButtonClass}
                  onClick={() => onReview?.(report)}
                >
                  {isIntegrityReportPending(report) ? t('integrity.review') : t('view')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default IntegrityReportsTable
