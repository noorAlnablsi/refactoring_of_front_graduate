import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Clock3, Play, UserRound } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'

function ExamCenterAvailableCard({ exam }) {
  const { t } = useTranslation('student')
  const navigate = useNavigate()

  const handleStart = () => {
    if (!exam?.id) return
    navigate(ROUTES.STUDENT_EXAM_ENTRY.replace(':testId', String(exam.id)))
  }

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="flex justify-start">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
            exam.proctored ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F1F5F9] text-[#64748B]'
          }`}
        >
          {exam.proctored ? t('examCenter.badges.proctored') : t('examCenter.badges.standard')}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 min-h-[3.5rem] text-start text-lg font-extrabold leading-7 text-[#2A3433]">
        {exam.title}
      </h3>

      <p className="mt-2 flex min-h-5 items-center gap-1.5 text-start text-sm text-[#64748B]">
        <UserRound className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={2} />
        <span className="truncate">{exam.teacher}</span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#EEF2F4] py-4">
        <div className="flex min-w-0 flex-col items-start gap-1 text-start">
          <p className="flex items-center gap-1 text-[11px] font-semibold leading-4 text-[#94A3B8]">
            <Clock3 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{t('examCenter.meta.duration')}</span>
          </p>
          <p className="w-full text-start text-sm font-bold leading-5 text-[#2A3433]">
            {t('examCenter.meta.durationValue', { count: exam.durationMinutes || 0 })}
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-1 text-start">
          <p className="flex items-center gap-1 text-[11px] font-semibold leading-4 text-[#94A3B8]">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{t('examCenter.meta.closingDate')}</span>
          </p>
          <p className="w-full text-start text-sm font-bold leading-5 text-[#2A3433]">
            {exam.closingDateLabel || '—'}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p
          className={`min-w-0 flex-1 text-start text-xs font-bold leading-5 ${
            exam.remainingUrgent ? 'text-[#EF4444]' : 'text-[#64748B]'
          }`}
        >
          {exam.remainingLabel
            ? t('examCenter.remaining.label', { value: exam.remainingLabel })
            : exam.availability || t('examCenter.remaining.flexible')}
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2AA8A2] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)] transition hover:opacity-95"
        >
          <Play className="h-4 w-4 fill-current" strokeWidth={2} />
          {t('examCenter.actions.start')}
        </button>
      </div>
    </article>
  )
}

export default ExamCenterAvailableCard
