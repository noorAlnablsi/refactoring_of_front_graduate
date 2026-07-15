import { Copy, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatQuestionForCopy,
  getDifficultyLabel,
  getQuestionTopicLabel,
  getQuestionTypeLabel,
} from '../../../lib/questionBanks'
import { useToastStore } from '../../../store/toastStore'

async function copyText(text, showToast, successMessage, errorMessages) {
  if (!text?.trim()) {
    showToast(errorMessages.noText, 'error')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    showToast(successMessage)
  } catch {
    showToast(errorMessages.failed, 'error')
  }
}

function QuestionsList({
  questions,
  emptyMessage,
  readOnly = false,
  topics = [],
  canEdit = false,
  onEditQuestion,
}) {
  const { t } = useTranslation('questionBanks')
  const showToast = useToastStore((s) => s.showToast)
  const copyErrors = {
    noText: t('copy.noText'),
    failed: t('copy.failed'),
  }

  const handleCopyQuestion = (question, index) => {
    copyText(
      formatQuestionForCopy(question),
      showToast,
      t('copy.questionSuccess', { number: index + 1 }),
      copyErrors,
    )
  }

  const handleCopyAll = () => {
    const text = questions
      .map((question, index) =>
        `${t('copy.questionHeader', { number: index + 1 })}\n${formatQuestionForCopy(question)}`,
      )
      .join('\n\n')
    copyText(text, showToast, t('copy.allSuccess'), copyErrors)
  }

  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">
          {emptyMessage || t('editor.noSessionQuestions')}
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-[#2A3433]">
          {readOnly ? t('editor.bankQuestionsTitle') : t('editor.addedQuestionsPreview')} ({questions.length})
        </h3>
        {readOnly ? (
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8F7F6] px-3 py-1.5 text-xs font-bold text-[#2AA8A2] hover:bg-[#DDF3F1]"
          >
            <Copy className="h-3.5 w-3.5" />
            {t('editor.copyAll')}
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <article key={`${question.id || 'local'}-${index}`} className="rounded-xl bg-[#F8FAFB] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#E8F7F6] px-2 py-1 text-xs font-bold text-[#2AA8A2]">
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <span>{getQuestionTypeLabel(question.type_code)}</span>
                  <span>•</span>
                  <span>{getDifficultyLabel(question.difficulty)}</span>
                  <span>•</span>
                  <span>{t('counts.points', { count: question.points })}</span>
                  <span>•</span>
                  <span>{getQuestionTopicLabel(question, topics)}</span>
                </div>
                {canEdit && question?.id ? (
                  <button
                    type="button"
                    onClick={() => onEditQuestion?.(question)}
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-white hover:text-[#2AA8A2]"
                    aria-label={t('editor.editQuestionAria', { number: index + 1 })}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
                {readOnly ? (
                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(question, index)}
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-white hover:text-[#2AA8A2]"
                    aria-label={t('editor.copyQuestionAria', { number: index + 1 })}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <div
              className="text-sm text-[#374151]"
              dangerouslySetInnerHTML={{ __html: question.body }}
            />
            {readOnly && Array.isArray(question.choices) && question.choices.length ? (
              <ul className="mt-3 space-y-1.5 text-sm text-[#64748B]">
                {question.choices.map((choice, choiceIndex) => (
                  <li
                    key={choice.id || choiceIndex}
                    className={choice.is_correct ? 'font-semibold text-[#0EA896]' : ''}
                  >
                    {choiceIndex + 1}. <span dangerouslySetInnerHTML={{ __html: choice.body }} />
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default QuestionsList
