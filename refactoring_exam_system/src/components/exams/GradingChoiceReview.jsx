import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import ChoiceBodyHtml from '../shared/ChoiceBodyHtml'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getTestQuestionChoices } from '../../lib/testQuestionEdit'

function GradingChoiceReview({ question, answer, hideCorrect = false }) {
  const { t, i18n } = useTranslation('exams')
  const choices = getTestQuestionChoices(question)
  const selectedIndices = Array.isArray(answer?.selected_choice_indices)
    ? answer.selected_choice_indices
        .map((value) => Number(value?.index ?? value?.choice_index ?? value))
        .filter((value) => Number.isFinite(value))
    : []
  const selectedIds = Array.isArray(answer?.selected_choice_ids)
    ? answer.selected_choice_ids.map((value) => String(value))
    : Array.isArray(answer?.selected_choices)
      ? answer.selected_choices
          .map((value) => value?.id ?? value?.choice_id)
          .filter((value) => value != null)
          .map((value) => String(value))
      : []
  const typeCode = String(question.snapshot_type_code || question.type_code || '').toUpperCase()
  const isTrueFalse = typeCode === 'TRUE_FALSE'
  const choiceLetters = i18n.getResource(i18n.language, 'exams', 'choiceLetters') || []

  if (!choices.length) return null

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold text-[#94A3B8]">{t('grading.auto.choicesTitle')}</p>
      <ul className="space-y-2">
        {choices.map((choice, index) => {
          const choiceIndex = Number(choice.index ?? choice.order_index ?? index)
          const isSelected =
            selectedIndices.includes(index) ||
            (Number.isFinite(choiceIndex) && selectedIndices.includes(choiceIndex)) ||
            (choice?.id != null && selectedIds.includes(String(choice.id)))
          const isCorrect = Boolean(choice.is_correct)
          const letter = choiceLetters[index] || formatLocaleNumber(index + 1)
          const studentWrong = isSelected && !isCorrect && !hideCorrect

          let wrapClass = 'bg-[#F6F8F9] text-[#64748B]'
          if (hideCorrect && isSelected) {
            wrapClass = 'bg-[#E8F7F6] text-[#2AA8A2] ring-1 ring-[#CFECE9]'
          } else if (!hideCorrect && isCorrect) {
            wrapClass = 'bg-[#ECFDF5] text-[#047857] ring-2 ring-[#34D399]'
          } else if (studentWrong) {
            wrapClass = 'bg-[#FEF2F2] text-[#B91C1C] ring-2 ring-[#F87171]'
          }

          return (
            <li
              key={choice.id || `${question.test_question_id}-${index}`}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${wrapClass}`}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {!isTrueFalse ? (
                  <span className="shrink-0 text-xs font-bold opacity-70">{letter})</span>
                ) : null}
                <ChoiceBodyHtml choice={choice} className="min-w-0 break-words" />
                {isSelected ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      studentWrong
                        ? 'bg-white/80 text-[#B91C1C]'
                        : 'bg-white/80 text-[#047857]'
                    }`}
                  >
                    {t('grading.auto.studentChoice')}
                  </span>
                ) : null}
                {isCorrect && !hideCorrect ? (
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                    {t('grading.auto.correctChoice')}
                  </span>
                ) : null}
              </span>
              {isCorrect && !hideCorrect ? (
                <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default GradingChoiceReview
