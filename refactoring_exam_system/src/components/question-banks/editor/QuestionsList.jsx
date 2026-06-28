import { Copy } from 'lucide-react'
import {
  formatQuestionForCopy,
  getDifficultyLabel,
  getQuestionTypeLabel,
} from '../../../lib/questionBanks'
import { useToastStore } from '../../../store/toastStore'

async function copyText(text, showToast, successMessage) {
  if (!text?.trim()) {
    showToast('لا يوجد نص للنسخ', 'error')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    showToast(successMessage)
  } catch {
    showToast('تعذّر النسخ إلى الحافظة', 'error')
  }
}

function QuestionsList({ questions, emptyMessage, readOnly = false }) {
  const showToast = useToastStore((s) => s.showToast)

  const handleCopyQuestion = (question, index) => {
    copyText(formatQuestionForCopy(question), showToast, `تم نسخ السؤال ${index + 1}`)
  }

  const handleCopyAll = () => {
    const text = questions
      .map((question, index) => `السؤال ${index + 1}:\n${formatQuestionForCopy(question)}`)
      .join('\n\n')
    copyText(text, showToast, 'تم نسخ جميع الأسئلة')
  }

  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">
          {emptyMessage || 'لا توجد أسئلة محفوظة في هذه الجلسة'}
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-[#2A3433]">
          {readOnly ? 'أسئلة البنك' : 'معاينة الأسئلة المضافة'} ({questions.length})
        </h3>
        {readOnly ? (
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8F7F6] px-3 py-1.5 text-xs font-bold text-[#2AA8A2] hover:bg-[#DDF3F1]"
          >
            <Copy className="h-3.5 w-3.5" />
            نسخ الكل
          </button>
        ) : (
          <span className="text-xs font-semibold text-[#94A3B8]">التعديل سيتوفر قريباً</span>
        )}
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
                  <span>{question.points} علامة</span>
                </div>
                {readOnly ? (
                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(question, index)}
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-white hover:text-[#2AA8A2]"
                    aria-label={`نسخ السؤال ${index + 1}`}
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
