import { useTranslation } from 'react-i18next'
import {
  formatAnalyticsCount,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function AnalyticsEngagedSubjects({ subjects = [], loading }) {
  const { t } = useTranslation('analytics')

  return (
    <section className={`p-5 ${shellCardClass}`}>
      <h2 className={shellSectionTitleClass}>{t('engagedSubjects.title')}</h2>

      {loading ? (
        <div className="shell-skeleton mt-5 h-40 animate-pulse rounded-xl" />
      ) : subjects.length === 0 ? (
        <p className={`mt-6 text-sm ${shellBodyTextClass}`}>{t('empty')}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`border-b border-[var(--shell-border)] text-xs ${shellSubtleTextClass}`}>
                <th className="px-2 py-3 text-start font-bold">{t('engagedSubjects.subject')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('engagedSubjects.students')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('engagedSubjects.teachers')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('engagedSubjects.tests')}</th>
                <th className="px-2 py-3 text-start font-bold">{t('engagedSubjects.score')}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.subject_id ?? subject.subject_name}
                  className="border-b border-[var(--shell-border)]/70 last:border-0"
                >
                  <td className="px-2 py-3 font-bold text-[var(--shell-text)]">
                    {subject.subject_name}
                  </td>
                  <td className={`px-2 py-3 ${shellBodyTextClass}`}>
                    {formatAnalyticsCount(subject.students_count)}
                  </td>
                  <td className={`px-2 py-3 ${shellBodyTextClass}`}>
                    {formatAnalyticsCount(subject.teachers_count)}
                  </td>
                  <td className={`px-2 py-3 ${shellBodyTextClass}`}>
                    {formatAnalyticsCount(subject.tests_count)}
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {formatAnalyticsPercent(subject.average_score)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AnalyticsEngagedSubjects
