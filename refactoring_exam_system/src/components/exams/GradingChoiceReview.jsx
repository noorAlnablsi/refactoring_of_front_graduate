import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import ChoiceBodyHtml from '../shared/ChoiceBodyHtml'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getTestQuestionChoices } from '../../lib/testQuestionEdit'

function GradingChoiceReview({ question, answer, hideCorrect = false }) {
  const { t, i18n } = useTranslation('exams')
  const choices = getTestQuestionChoices(question)
  const selected = Array.isArray(answer?.selected_choice_indices)
    ? answer.selected_choice_indices
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
          const isSelected = selected.includes(index)
          const isCorrect = Boolean(choice.is_correct)
          const letter = choiceLetters[index] || formatLocaleNumber(index + 1)

          return (
            <li
              key={choice.id || `${question.test_question_id}-${index}`}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                isSelected
                  ? 'bg-[#E8F7F6] text-[#2AA8A2] ring-1 ring-[#CFECE9]'
                  : 'bg-[#F6F8F9] text-[#64748B]'
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {!isTrueFalse ? (
                  <span className="shrink-0 text-xs font-bold text-[#94A3B8]">{letter})</span>
                ) : null}
                <ChoiceBodyHtml choice={choice} className="min-w-0 break-words" />
                {isSelected ? (
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#2AA8A2]">
                    {t('grading.auto.studentChoice')}
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
