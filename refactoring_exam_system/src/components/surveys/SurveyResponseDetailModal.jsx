import { useTranslation } from 'react-i18next'
import { useSurveyManagerResponseDetail } from '../../hooks/surveys/useSurveyManagerResponseDetail'
import { formatLocaleNumber } from '../../lib/localeNumber'
import QuestionStemBlock from '../shared/QuestionStemBlock'
import ChoiceBodyHtml from '../shared/ChoiceBodyHtml'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function AnswerBlock({ answer, index }) {
  const { t } = useTranslation('surveys')
  const typeCode = String(answer?.question_type || '').toUpperCase()
  const selectedChoices = Array.isArray(answer?.selected_choices) ? answer.selected_choices : []
  const essayText = String(answer?.answer_text || '').trim()

  const questionText = String(answer?.question_text || '').trim()

  return (
    <article className={`p-4 ${shellCardClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[var(--shell-text)]">
          {t('respond.questionNumber', { number: formatLocaleNumber(index + 1) })}
        </h3>
        {typeCode ? (
          <span className="rounded-lg bg-[var(--shell-accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--shell-accent)]">
            {t(`respond.types.${typeCode.toLowerCase()}`, { defaultValue: typeCode })}
          </span>
        ) : null}
      </div>

      <QuestionStemBlock
        question={{
          body: questionText,
          image_path: answer?.image_path,
          image_url: answer?.image_url,
        }}
        textClassName="mt-3 text-sm leading-7 text-[var(--shell-text)]"
        imageWrapClassName="mt-4 overflow-hidden rounded-xl bg-[var(--shell-input-bg)]"
        imageClassName="max-h-56 w-full rounded-xl object-contain"
      />

      <div className="mt-4">
        <p className={`text-xs font-bold ${shellBodyTextClass}`}>{t('responses.detail.answerLabel')}</p>
        {essayText ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--shell-text)]">{essayText}</p>
        ) : selectedChoices.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {selectedChoices.map((choice) => (
              <li
                key={`${answer.test_question_id}-${choice.index}`}
                className="rounded-xl bg-[var(--shell-accent-bg)] px-3 py-2 text-sm font-semibold text-[var(--shell-accent)]"
              >
                {choice.body ? (
                  <ChoiceBodyHtml choice={choice} />
                ) : (
                  t('responses.detail.choiceFallback', { index: formatLocaleNumber(choice.index) })
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-2 ${shellSubtleTextClass}`}>{t('responses.detail.emptyAnswer')}</p>
        )}
      </div>
    </article>
  )
}

function SurveyResponseDetailModal({ open, surveyId, responseId, onClose }) {
  const { t } = useTranslation(['surveys', 'common'])
  const { detail, loading, error, refetch } = useSurveyManagerResponseDetail(
    open ? surveyId : null,
    open ? responseId : null,
  )

  if (!open) return null

  const answers = Array.isArray(detail?.answers) ? detail.answers : []

  return (
    <div
      className={shellModalOverlayClass}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-response-detail-title"
        className={`max-w-2xl ${shellModalPanelClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="survey-response-detail-title" className={shellSectionTitleClass}>
              {t('responses.detail.title')}
            </h2>
            <p className={`mt-2 ${shellBodyTextClass}`}>
              {detail?.user_full_name || t('responses.unknownUser')}
              {detail?.user_email ? ` · ${detail.user_email}` : ''}
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={refetch} className="mt-2 font-bold text-[var(--shell-accent)]">
              {t('responses.errors.retry')}
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className={`mt-6 ${shellBodyTextClass}`}>{t('responses.detail.loading')}</p>
        ) : null}

        {!loading && !error && detail ? (
          <>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className={`text-xs font-bold ${shellBodyTextClass}`}>{t('responses.table.submittedAt')}</dt>
                <dd className="mt-1 font-bold text-[var(--shell-text)]">{formatDateTime(detail.submitted_at)}</dd>
              </div>
              <div>
                <dt className={`text-xs font-bold ${shellBodyTextClass}`}>{t('responses.table.updatedAt')}</dt>
                <dd className="mt-1 font-bold text-[var(--shell-text)]">
                  {formatDateTime(detail.updated_at || detail.created_at)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-extrabold text-[var(--shell-text)]">
                {t('responses.detail.answersTitle', { count: formatLocaleNumber(answers.length) })}
              </p>
              {answers.length === 0 ? (
                <p className={shellSubtleTextClass}>{t('responses.detail.emptyAnswers')}</p>
              ) : (
                answers.map((answer, index) => (
                  <AnswerBlock key={answer.test_question_id ?? index} answer={answer} index={index} />
                ))
              )}
            </div>
          </>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className={shellAccentButtonClass}>
            {t('actions.close', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SurveyResponseDetailModal
