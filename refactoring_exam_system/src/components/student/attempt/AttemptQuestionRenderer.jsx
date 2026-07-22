import { Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getQuestionImageUrl,
  isEssayQuestion,
  isMultiSelectQuestion,
} from '../../../lib/attemptAnswers'

function AttemptQuestionRenderer({
  question,
  answer,
  questionIndex,
  questionTotal,
  marked,
  onToggleMark,
  onSelectChoice,
  onEssayChange,
  disabled = false,
  variant = 'free',
  subjectName = '',
}) {
  const { t, i18n } = useTranslation(['student', 'exams'])
  if (!question) return null

  const typeCode = question.snapshot_type_code
  const choices = Array.isArray(question.choices) ? question.choices : []
  const selected = Array.isArray(answer?.selected_choice_indices)
    ? answer.selected_choice_indices
    : []

  const multi = isMultiSelectQuestion(typeCode)
  const essay = isEssayQuestion(typeCode)
  const imageUrl = getQuestionImageUrl(question)
  const choiceLetters = i18n.getResource(i18n.language, 'exams', 'choiceLetters') || []
  const sequential = variant === 'sequential'

  if (sequential) {
    return (
      <article className="mx-auto mt-5 w-full max-w-4xl px-4 md:px-6">
        <div className="rounded-2xl border-e-4 border-[#2AA8A2] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80 md:p-7">
          {subjectName ? (
            <span className="inline-flex rounded-lg bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#64748B]">
              {subjectName}
            </span>
          ) : null}

          <h2 className="mt-3 text-start text-lg font-extrabold leading-8 text-[#2A3433] md:text-xl">
            {question.snapshot_question_text || t('attempt.questionFallback')}
          </h2>

          {question.snapshot_difficulty ? (
            <p className="mt-2 text-xs font-bold text-[#94A3B8]">{question.snapshot_difficulty}</p>
          ) : null}

          {imageUrl ? (
            <div className="mt-5 overflow-hidden rounded-2xl bg-[#EFF6FF] ring-1 ring-[#DBEAFE]">
              <img src={imageUrl} alt="" loading="lazy" className="max-h-[320px] w-full object-contain" />
            </div>
          ) : null}

          {essay ? (
            <textarea
              value={answer?.answer_text || ''}
              onChange={(e) => onEssayChange?.(question.test_question_id, e.target.value)}
              disabled={disabled}
              rows={8}
              placeholder={t('attempt.essayPlaceholder')}
              className="mt-5 w-full rounded-2xl bg-[#F8FAFB] px-4 py-3 text-sm text-[#2A3433] outline-none ring-1 ring-[#E5E9EB] focus:ring-2 focus:ring-[#2AA8A2]/35 disabled:opacity-60"
            />
          ) : (
            <div className="mt-5 space-y-3">
              {choices.map((choice, index) => {
                const label =
                  typeof choice === 'string'
                    ? choice
                    : choice?.body ||
                      choice?.text ||
                      choice?.label ||
                      `${t('attempt.choice')} ${index + 1}`
                const checked = selected.includes(index)

                return (
                  <label
                    key={`${question.test_question_id}-${index}`}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-4 transition ${
                      checked
                        ? 'bg-[#E8F7F6] ring-2 ring-[#2AA8A2]'
                        : 'bg-[#F3F6F7] ring-1 ring-transparent hover:bg-[#EEF2F4]'
                    } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <span className="text-sm font-semibold leading-7 text-[#2A3433]">{label}</span>
                    <input
                      type={multi ? 'checkbox' : 'radio'}
                      name={`q-${question.test_question_id}`}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onSelectChoice?.(question.test_question_id, typeCode, index)}
                      className="h-5 w-5 shrink-0 accent-[#2AA8A2]"
                    />
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E5E9EB] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#E8F7F6] px-3 py-1.5 text-xs font-extrabold text-[#2AA8A2]">
          {t('attempt.questionProgress', { current: questionIndex + 1, total: questionTotal })}
        </span>
        <span className="text-xs font-bold text-[#64748B]">
          {t('attempt.points', { count: question.points ?? 0 })}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h2 className="flex-1 text-start text-lg font-extrabold leading-8 text-[#2A3433] md:text-xl">
          {question.snapshot_question_text || t('attempt.questionFallback')}
        </h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleMark?.(question.test_question_id)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            marked
              ? 'bg-[#FDF2F8] text-[#DB2777] ring-1 ring-[#FBCFE8]'
              : 'bg-[#F8FAFB] text-[#64748B] ring-1 ring-[#E5E9EB] hover:text-[#2AA8A2]'
          } disabled:opacity-60`}
        >
          <Bookmark className={`h-4 w-4 ${marked ? 'fill-[#EC4899] text-[#EC4899]' : ''}`} />
          {marked ? t('attempt.unmark') : t('attempt.mark')}
        </button>
      </div>

      {question.snapshot_difficulty ? (
        <p className="mt-2 text-xs font-bold text-[#94A3B8]">{question.snapshot_difficulty}</p>
      ) : null}

      {imageUrl ? (
        <div className="mt-5 overflow-hidden rounded-2xl bg-[#F8FAFB] ring-1 ring-[#E5E9EB]">
          <img src={imageUrl} alt="" loading="lazy" className="max-h-[320px] w-full object-contain" />
        </div>
      ) : null}

      {essay ? (
        <textarea
          value={answer?.answer_text || ''}
          onChange={(e) => onEssayChange?.(question.test_question_id, e.target.value)}
          disabled={disabled}
          rows={8}
          placeholder={t('attempt.essayPlaceholder')}
          className="mt-5 w-full rounded-2xl bg-[#F8FAFB] px-4 py-3 text-sm text-[#2A3433] outline-none ring-1 ring-[#E5E9EB] focus:ring-2 focus:ring-[#2AA8A2]/35 disabled:opacity-60"
        />
      ) : (
        <div className="mt-5 space-y-3">
          {choices.map((choice, index) => {
            const label =
              typeof choice === 'string'
                ? choice
                : choice?.body || choice?.text || choice?.label || `${t('attempt.choice')} ${index + 1}`
            const checked = selected.includes(index)
            const letter = choiceLetters[index] || String.fromCharCode(97 + index)

            return (
              <label
                key={`${question.test_question_id}-${index}`}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3.5 ring-1 transition ${
                  checked
                    ? 'bg-white ring-2 ring-[#2AA8A2]'
                    : 'bg-[#F8FAFB] ring-[#E5E9EB] hover:ring-[#CBD5E1]'
                } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
              >
                <span className="text-sm font-semibold leading-7 text-[#2A3433]">{label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#94A3B8]">{letter}</span>
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={`q-${question.test_question_id}`}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onSelectChoice?.(question.test_question_id, typeCode, index)}
                    className="h-4 w-4 accent-[#2AA8A2]"
                  />
                </span>
              </label>
            )
          })}
        </div>
      )}
    </article>
  )
}

export default AttemptQuestionRenderer
