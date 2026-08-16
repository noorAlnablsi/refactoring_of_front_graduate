import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useSurveyManagerResponses } from '../../hooks/surveys/useSurveyManagerResponses'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  getSurveyResponseStatus,
  SURVEY_RESPONSE_STATUS,
} from '../../lib/surveyResponses'
import { getTestName } from '../../lib/testModel'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellSubtleTextClass,
  shellTableHostClass,
  shellTableScrollClass,
} from '../../lib/shellUi'

function statusBadgeClass(status) {
  if (status === SURVEY_RESPONSE_STATUS.SUBMITTED) return 'bg-[#E8F7F6] text-[#2AA8A2]'
  if (status === SURVEY_RESPONSE_STATUS.IN_PROGRESS) return 'bg-[#EEF2FF] text-[#4F46E5]'
  return 'bg-[#F1F5F9] text-[#64748B]'
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function SurveyResponsesPage() {
  const { id: surveyId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('surveys')
  const { survey, totals, responses, loading, error, refetch } = useSurveyManagerResponses(surveyId)
  const surveyName = getTestName(survey) || t('card.untitled')

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('responses.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>{t('responses.title')}</h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>
            {t('responses.subtitle', { name: surveyName })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SURVEYS)}
          className={shellAccentButtonClass}
        >
          <ArrowRight className="h-4 w-4" />
          {t('responses.back')}
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 font-bold text-[var(--shell-accent)]"
          >
            {t('responses.errors.retry')}
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { key: 'total', value: totals?.total },
          { key: 'submitted', value: totals?.submitted },
          { key: 'inProgress', value: totals?.in_progress },
        ].map((item) => (
          <article key={item.key} className={`p-5 ${shellCardClass}`}>
            <p className={`text-sm font-semibold ${shellBodyTextClass}`}>
              {t(`responses.stats.${item.key}`)}
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--shell-text)]">
              {loading ? '—' : formatLocaleNumber(item.value ?? 0)}
            </p>
          </article>
        ))}
      </div>

      <p className={`text-sm ${shellSubtleTextClass}`}>{t('responses.summaryOnlyNote')}</p>

      <div className={shellTableHostClass}>
        <div className={shellTableScrollClass}>
          <table className="min-w-full text-right text-sm">
            <thead className="bg-[var(--shell-input-bg)] text-[var(--shell-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-bold">{t('responses.table.respondent')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.email')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.status')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.submittedAt')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.updatedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--shell-text-muted)]">
                    {t('responses.loading')}
                  </td>
                </tr>
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--shell-text-muted)]">
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      {t('responses.empty')}
                    </span>
                  </td>
                </tr>
              ) : (
                responses.map((row) => {
                  const status = getSurveyResponseStatus(row)
                  return (
                    <tr key={row.response_id} className="border-t border-[var(--shell-border)]">
                      <td className="px-4 py-3 font-semibold text-[var(--shell-text)]">
                        {row.user_full_name || t('responses.unknownUser')}
                      </td>
                      <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                        {row.user_email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(status)}`}
                        >
                          {t(`responses.status.${status === SURVEY_RESPONSE_STATUS.SUBMITTED ? 'submitted' : status === SURVEY_RESPONSE_STATUS.IN_PROGRESS ? 'inProgress' : 'unknown'}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                        {formatDateTime(row.submitted_at)}
                      </td>
                      <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                        {formatDateTime(row.updated_at || row.created_at)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SurveyResponsesPage
