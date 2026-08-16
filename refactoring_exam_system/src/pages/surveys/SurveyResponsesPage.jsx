import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardList } from 'lucide-react'
import SurveyResponseDetailModal from '../../components/surveys/SurveyResponseDetailModal'
import { ROUTES } from '../../constants/routes'
import { useSurveyManagerResponses } from '../../hooks/surveys/useSurveyManagerResponses'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getTestName } from '../../lib/testModel'
import {
  shellAccentButtonClass,
  shellAccentSoftButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellTableHostClass,
  shellTableScrollClass,
} from '../../lib/shellUi'

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
  const [selectedResponseId, setSelectedResponseId] = useState(null)
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

      <article className={`max-w-xs p-5 ${shellCardClass}`}>
        <p className={`text-sm font-semibold ${shellBodyTextClass}`}>
          {t('responses.stats.submitted')}
        </p>
        <p className="mt-3 text-3xl font-extrabold text-[var(--shell-text)]">
          {loading ? '—' : formatLocaleNumber(totals?.submitted ?? 0)}
        </p>
      </article>

      <div className={shellTableHostClass}>
        <div className={shellTableScrollClass}>
          <table className="min-w-full text-right text-sm">
            <thead className="bg-[var(--shell-input-bg)] text-[var(--shell-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-bold">{t('responses.table.respondent')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.email')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.submittedAt')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.updatedAt')}</th>
                <th className="px-4 py-3 font-bold">{t('responses.table.actions')}</th>
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
                responses.map((row) => (
                  <tr key={row.response_id} className="border-t border-[var(--shell-border)]">
                    <td className="px-4 py-3 font-semibold text-[var(--shell-text)]">
                      {row.user_full_name || t('responses.unknownUser')}
                    </td>
                    <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                      {row.user_email || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                      {formatDateTime(row.submitted_at)}
                    </td>
                    <td className="px-4 py-3 text-[var(--shell-text-muted)]">
                      {formatDateTime(row.updated_at || row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedResponseId(row.response_id)}
                        className={shellAccentSoftButtonClass}
                      >
                        {t('responses.table.viewAnswers')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SurveyResponseDetailModal
        open={selectedResponseId != null}
        surveyId={surveyId}
        responseId={selectedResponseId}
        onClose={() => setSelectedResponseId(null)}
      />
    </div>
  )
}

export default SurveyResponsesPage
