import { useTranslation } from 'react-i18next'
import {
  isEssayQuestion,
  isMultiSelectQuestion,
} from '../../../lib/attemptAnswers'

function AttemptQuestionRenderer({
  question,
  answer,
  onSelectChoice,
  onEssayChange,
  disabled = false,
}) {
  const { t } = useTranslation('student')
  if (!question) return null

  const typeCode = question.snapshot_type_code
  const choices = Array.isArray(question.choices) ? question.choices : []
  const selected = Array.isArray(answer?.selected_choice_indices)
    ? answer.selected_choice_indices
    : []

  const multi = isMultiSelectQuestion(typeCode)
  const essay = isEssayQuestion(typeCode)

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E5E9EB]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#64748B]">
        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1">{typeCode}</span>
        {question.snapshot_difficulty ? (
          <span className="rounded-full bg-[#EEF2F3] px-2.5 py-1">{question.snapshot_difficulty}</span>
        ) : null}
        <span className="rounded-full bg-[#E8F7F6] px-2.5 py-1 text-[#2AA8A2]">
          {t('attempt.points', { count: question.points ?? 0 })}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-extrabold leading-8 text-[#2A3433]">
        {question.snapshot_question_text || t('attempt.questionFallback')}
      </h2>

      {essay ? (
        <textarea
          value={answer?.answer_text || ''}
          onChange={(e) => onEssayChange?.(question.test_question_id, e.target.value)}
          disabled={disabled}
          rows={8}
          placeholder={t('attempt.essayPlaceholder')}
          className="mt-5 w-full rounded-xl bg-[#F8FAFB] px-4 py-3 text-sm text-[#2A3433] outline-none ring-1 ring-[#E5E9EB] focus:ring-2 focus:ring-[#2AA8A2]/35 disabled:opacity-60"
        />
      ) : (
        <div className="mt-5 space-y-3">
          {choices.map((choice, index) => {
            const label =
              typeof choice === 'string'
                ? choice
                : choice?.body || choice?.text || choice?.label || `${t('attempt.choice')} ${index + 1}`
            const checked = selected.includes(index)

            return (
              <label
                key={`${question.test_question_id}-${index}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 ring-1 transition ${
                  checked
                    ? 'bg-[#E8F7F6] ring-[#2AA8A2]'
                    : 'bg-[#F8FAFB] ring-[#E5E9EB] hover:ring-[#CBD5E1]'
                } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={`q-${question.test_question_id}`}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onSelectChoice?.(question.test_question_id, typeCode, index)}
                  className="mt-1 accent-[#2AA8A2]"
                />
                <span className="text-sm font-semibold leading-6 text-[#2A3433]">{label}</span>
              </label>
            )
          })}
        </div>
      )}
    </article>
  )
}

export default AttemptQuestionRenderer
