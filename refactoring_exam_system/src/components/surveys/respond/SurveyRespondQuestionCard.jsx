import { useTranslation } from 'react-i18next'
import {
  isEssayQuestion,
  isMultiSelectQuestion,
} from '../../../lib/attemptAnswers'
import { getChoiceIndex } from '../../../lib/surveyResponses'
import { formatLocaleNumber } from '../../../lib/localeNumber'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function SurveyRespondQuestionCard({
  question,
  index,
  answer,
  disabled = false,
  onSelectChoice,
  onChangeEssay,
}) {
  const { t } = useTranslation('surveys')
  const questionId = question.test_question_id
  const typeCode = question.type_code
  const multi = isMultiSelectQuestion(typeCode)
  const essay = isEssayQuestion(typeCode)
  const selected = Array.isArray(answer?.selected_choice_indices)
    ? answer.selected_choice_indices
    : []
  const choices = Array.isArray(question.choices) ? question.choices : []

  return (
    <article className={`p-5 ${shellCardClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className={`text-base ${shellPageTitleClass}`}>
          {t('respond.questionNumber', { number: formatLocaleNumber(index + 1) })}
        </h2>
        <span className="rounded-lg bg-[var(--shell-accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--shell-accent)]">
          {t(`respond.types.${String(typeCode || 'MCQ').toLowerCase()}`, {
            defaultValue: typeCode,
          })}
        </span>
      </div>

      <div
        className={`mt-3 text-sm leading-7 text-[var(--shell-text)]`}
        dangerouslySetInnerHTML={{ __html: question.body || '' }}
      />

      {question.image_path ? (
        <img
          src={question.image_path}
          alt=""
          className="mt-4 max-h-64 w-full rounded-xl object-contain"
        />
      ) : null}

      {essay ? (
        <textarea
          value={answer?.answer_text || ''}
          disabled={disabled}
          onChange={(event) => onChangeEssay?.(questionId, event.target.value)}
          rows={4}
          placeholder={t('respond.essayPlaceholder')}
          className="mt-5 w-full rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm text-[var(--shell-text)] outline-none placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/30 disabled:opacity-60"
        />
      ) : (
        <div
          role={multi ? 'group' : 'radiogroup'}
          aria-label={t('respond.choicesAria')}
          className="mt-5 space-y-3"
        >
          {choices.map((choice, choiceIndex) => {
            const choiceIdx = getChoiceIndex(choice, choiceIndex)
            const checked = selected.includes(choiceIdx)
            return (
              <label
                key={`${questionId}-${choiceIdx}`}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 transition ${
                  checked
                    ? 'bg-[var(--shell-accent-bg)] ring-1 ring-[var(--shell-accent)]/30'
                    : 'bg-[var(--shell-input-bg)] hover:bg-[var(--shell-hover)]'
                } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
              >
                <span className={`min-w-0 flex-1 break-words text-sm font-semibold leading-7 ${shellBodyTextClass}`}>
                  <span dangerouslySetInnerHTML={{ __html: choice.body || '' }} />
                </span>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={`survey-q-${questionId}`}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onSelectChoice?.(questionId, typeCode, choiceIdx)}
                  className="h-5 w-5 shrink-0 accent-[var(--shell-accent)]"
                />
              </label>
            )
          })}
        </div>
      )}
    </article>
  )
}

export default SurveyRespondQuestionCard
