import { X } from 'lucide-react'
import { getQuestionTypeLabel } from '../../../lib/questionBanks'

function PreviewChoices({ question }) {
  if (question.type_code === 'ESSAY') {
    return <p className="mt-3 rounded-lg bg-[#F8FAFB] px-3 py-2 text-sm text-[#64748B]">سؤال مقالي بدون خيارات.</p>
  }

  if (question.type_code === 'TRUE_FALSE') {
    const correctText = question.choices?.find((choice) => choice.is_correct)?.body || '—'
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {['صح', 'خطأ'].map((label) => (
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

function PreviewQuestionsModal({ open, questions, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div dir="rtl" className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2A3433]">معاينة الأسئلة</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-auto">
          {questions.map((question, index) => (
            <article key={`${question.id || 'local'}-${index}`} className="rounded-xl border border-[#EEF2F3] p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[#64748B]">
                <span>سؤال {index + 1}</span>
                <span>{getQuestionTypeLabel(question.type_code)}</span>
              </div>
              <p className="text-sm font-semibold text-[#374151]">{question.body}</p>
              <PreviewChoices question={question} />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PreviewQuestionsModal
