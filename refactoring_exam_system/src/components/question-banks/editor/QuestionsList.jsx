import { getDifficultyLabel, getQuestionTypeLabel } from '../../../lib/questionBanks'

function QuestionsList({ questions }) {
  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">لا توجد أسئلة محفوظة في هذه الجلسة</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#2A3433]">معاينة الأسئلة المضافة ({questions.length})</h3>
        <span className="text-xs font-semibold text-[#94A3B8]">التعديل سيتوفر قريباً</span>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <article key={`${question.id || 'local'}-${index}`} className="rounded-xl bg-[#F8FAFB] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#E8F7F6] px-2 py-1 text-xs font-bold text-[#2AA8A2]">
                {index + 1}
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                <span>{getQuestionTypeLabel(question.type_code)}</span>
                <span>•</span>
                <span>{getDifficultyLabel(question.difficulty)}</span>
                <span>•</span>
                <span>{question.points} علامة</span>
              </div>
            </div>
            <p className="text-sm text-[#374151]">{question.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default QuestionsList
