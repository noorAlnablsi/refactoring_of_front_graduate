import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { getQuestionTopicLabel, getQuestionTypeLabel } from '../../../lib/questionBanks'
import { resolveQuestionImageSrc } from '../../../lib/questionImage'
import { customModalOverlayClass, customModalPanelSafeClass } from '../../../lib/shellUi'

function PreviewChoices({ question, t }) {
  if (question.type_code === 'ESSAY') {
    return <p className="mt-3 rounded-lg bg-[#F8FAFB] px-3 py-2 text-sm text-[#64748B]">{t('editor.essayNoChoices')}</p>
  }

  if (question.type_code === 'TRUE_FALSE') {
    const correctText = question.choices?.find((choice) => choice.is_correct)?.body || '—'
    const labels = [t('choices.true'), t('choices.false')]

    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {labels.map((label) => (
          <div
            key={label}
            className={`rounded-lg px-3 py-2 text-sm ${
              correctText === label ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F8FAFB] text-[#475569]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="mt-3 space-y-2">
      {question.choices?.map((choice, choiceIndex) => (
        <li
          key={`${choice.body}-${choiceIndex}`}
          className={`rounded-lg px-3 py-2 text-sm ${
            choice.is_correct ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F8FAFB] text-[#475569]'
          }`}
        >
          {choice.body}
        </li>
      ))}
    </ul>
  )
}

function PreviewQuestionsModal({ open, questions, topics = [], onClose }) {
  const { t } = useTranslation('questionBanks')

  if (!open) return null

  return (
    <div className={customModalOverlayClass}>
      <div dir="rtl" className={`w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl ${customModalPanelSafeClass}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2A3433]">{t('editor.previewQuestions')}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-auto">
          {questions.map((question, index) => {
            const imageSrc = resolveQuestionImageSrc(question)
            return (
            <article key={`${question.id || 'local'}-${index}`} className="rounded-xl border border-[#EEF2F3] p-4">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[#64748B]">
                <span>{t('editor.questionNumber', { number: index + 1 })}</span>
                <div className="flex items-center gap-2">
                  <span>{getQuestionTypeLabel(question.type_code)}</span>
                  <span>•</span>
                  <span>{getQuestionTopicLabel(question, topics)}</span>
                </div>
              </div>
              <div
                className="text-sm font-semibold text-[#374151]"
                dangerouslySetInnerHTML={{ __html: question.body }}
              />
              {imageSrc ? (
                <div className="mt-3 overflow-hidden rounded-xl bg-[#F8FAFB] ring-1 ring-[#E5E9EB]">
                  <img src={imageSrc} alt="" className="max-h-56 w-full object-contain" />
                </div>
              ) : null}
              <PreviewChoices question={question} t={t} />
            </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PreviewQuestionsModal
