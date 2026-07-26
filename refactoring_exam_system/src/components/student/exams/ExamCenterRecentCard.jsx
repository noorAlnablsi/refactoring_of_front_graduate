import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Ellipsis, Eye, Hourglass, Lock } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'

function ExamCenterRecentCard({ exam }) {
  const { t } = useTranslation('student')
  const navigate = useNavigate()

  const handleAction = () => {
    if (!exam.actionEnabled) return
    navigate(ROUTES.STUDENT_RESULTS)
  }

  const badgeClass =
    exam.badgeKey === 'pendingGrading'
      ? 'bg-[#EEF2FF] text-[#6366F1]'
      : 'bg-[#E8F7F6] text-[#2AA8A2]'

  const StatusIcon =
    exam.badgeKey === 'pendingGrading'
      ? Ellipsis
      : exam.badgeKey === 'gradedReviewOpen'
        ? BadgeCheck
        : Lock

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}>
          {t(`examCenter.badges.${exam.badgeKey}`)}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F8F9] text-[#94A3B8]">
          <StatusIcon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>

      <h3 className="mt-4 text-lg font-extrabold leading-7 text-[#2A3433]">{exam.title}</h3>
      <p className="mt-2 text-sm text-[#64748B]">{exam.teacher}</p>
      {exam.subject && exam.subject !== '—' ? (
        <p className="mt-1 text-xs font-semibold text-[#94A3B8]">{exam.subject}</p>
      ) : null}

      <div className="mt-6">
        <p className="text-xs font-semibold text-[#94A3B8]">{t('examCenter.score.label')}</p>
        <p
          className={`mt-1 text-3xl font-extrabold tracking-tight ${
            exam.isPending ? 'text-[#94A3B8]' : 'text-[#2AA8A2]'
          }`}
        >
          {exam.scoreDisplay}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAction}
        disabled={!exam.actionEnabled}
        className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
          exam.actionKey === 'viewResultAndReview'
            ? 'bg-[#2AA8A2] text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)] hover:opacity-95'
            : exam.actionEnabled
              ? 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E8EDF2]'
              : 'cursor-not-allowed bg-[#F1F5F9] text-[#94A3B8]'
        }`}
      >
        {exam.actionKey === 'reviewUnavailable' ? (
          <Hourglass className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={2} />
        )}
        {t(`examCenter.actions.${exam.actionKey}`)}
      </button>
    </article>
  )
}

export default ExamCenterRecentCard
