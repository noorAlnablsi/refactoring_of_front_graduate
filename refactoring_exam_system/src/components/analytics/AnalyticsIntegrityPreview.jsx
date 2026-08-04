import { Link } from 'react-router-dom'
import { AlertTriangle, FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnalyticsAvatar from './AnalyticsAvatar'
import { ROUTES } from '../../constants/routes'
import {
  formatAnalyticsCount,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import {
  shellAccentSoftButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function AnalyticsIntegrityPreview({
  problematicExams = [],
  integrityPreview = [],
  loading,
  onViewReport,
}) {
  const { t } = useTranslation('analytics')
  const exams = problematicExams.slice(0, 3)
  const hasExams = exams.length > 0
  const hasReports = integrityPreview.length > 0

  return (
    <section className={`flex h-full flex-col p-5 ${shellCardClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <FileWarning className="h-4 w-4" />
          </span>
          <h2 className={shellSectionTitleClass}>{t('integrity.title')}</h2>
        </div>
        <Link
          to={ROUTES.ANALYTICS_INTEGRITY_REPORTS}
          className="text-xs font-bold text-[var(--shell-accent)] hover:underline"
        >
          {t('viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="shell-skeleton mt-5 h-48 animate-pulse rounded-xl" />
      ) : !hasExams && !hasReports ? (
        <p className={`mt-6 text-sm ${shellBodyTextClass}`}>{t('integrity.empty')}</p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col gap-4">
          {hasExams ? (
            <ul className="space-y-3">
              {exams.map((exam) => (
                <li
                  key={exam.test_id ?? exam.test_name}
                  className="rounded-xl bg-rose-50/70 p-4 ring-1 ring-rose-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[var(--shell-text)]">
                        {exam.test_name}
                      </p>
                      <p className={`mt-2 text-xs ${shellSubtleTextClass}`}>
                        {exam.subject_name || exam.teacher_name || '—'}
                        {' · '}
                        {t('integrity.reportsCount', {
                          count: formatAnalyticsCount(exam.reports_count),
                        })}
                        {' · '}
                        {t('integrity.average', {
                          score: formatAnalyticsPercent(exam.average_score),
                        })}
                      </p>
                    </div>
                    {exam.risk_percentage != null ? (
                      <span className="shrink-0 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
                        {t('integrity.risk', {
                          rate: formatAnalyticsPercent(exam.risk_percentage),
                        })}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {hasReports ? (
            <ul className="space-y-3">
              {integrityPreview.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--shell-input-bg)] px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AnalyticsAvatar
                      name={report.student_name}
                      avatarUrl={report.avatar_url}
                      initials={(report.student_name || '?').slice(0, 2)}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                        {report.student_name}
                      </p>
                      <p className={`truncate text-[11px] ${shellSubtleTextClass}`}>
                        {report.test_name}
                      </p>
                    </div>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                  </div>
                  <button
                    type="button"
                    className={shellAccentSoftButtonClass}
                    onClick={() => onViewReport?.(report)}
                  >
                    {t('view')}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default AnalyticsIntegrityPreview
