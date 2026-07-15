import { useTranslation } from 'react-i18next'

function StudentExamCard({ exam }) {
  const { t } = useTranslation('student')

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold text-[#94A3B8]">{exam.subject}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            exam.proctored ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F1F5F9] text-[#64748B]'
          }`}
        >
          {exam.proctored ? t('examCard.proctored') : t('examCard.regular')}
        </span>
      </div>

      <h3 className="mt-3 text-base font-extrabold leading-7 text-[#2A3433]">{exam.title}</h3>

      <p className="mt-2 text-sm text-[#64748B]">{exam.teacher}</p>
      <p className="mt-1 text-sm font-semibold text-[#64748B]">
        {t('examCard.meta', { minutes: exam.durationMinutes, questions: exam.questionsCount })}
      </p>
      <p className="mt-1 text-xs text-[#94A3B8]">{exam.availability}</p>

      <button
        type="button"
        className="mt-auto w-full rounded-xl bg-[#2AA8A2] py-3 pt-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)] transition hover:opacity-95"
      >
        {t('examCard.start')}
      </button>
    </article>
  )
}

export default StudentExamCard
