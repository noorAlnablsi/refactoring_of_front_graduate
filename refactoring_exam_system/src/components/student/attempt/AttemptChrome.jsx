import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CircleHelp,
  Clock3,
  Monitor,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatCountdownSpaced,
  isAnswerProvided,
} from '../../../lib/attemptAnswers'

function AttemptExamHeader({
  examTitle,
  subjectName,
  studentName,
  studentAvatarUrl,
  proctoringActive,
}) {
  const { t } = useTranslation('student')
  const initials = (studentName || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <header className="border-b border-[#E5E9EB] bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7F6] text-[#2AA8A2]">
            <BookOpen className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 text-start">
            <h1 className="truncate text-base font-extrabold text-[#2A3433] md:text-lg">
              {examTitle || t('attempt.title')}
            </h1>
            {subjectName ? (
              <p className="truncate text-sm text-[#64748B]">{subjectName}</p>
            ) : null}
            {proctoringActive ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#2AA8A2]">
                <Monitor className="h-3.5 w-3.5" />
                {t('attempt.proctoringActive')}
              </p>
            ) : null}
          </div>
        </div>

        {studentName ? (
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-sm font-extrabold text-[#2A3433]">{studentName}</p>
            </div>
            {studentAvatarUrl ? (
              <img
                src={studentAvatarUrl}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-[#E8F7F6]"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F6] text-sm font-extrabold text-[#2AA8A2]">
                {initials}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}

function AttemptSidebar({
  remainingSeconds,
  questions,
  answersMap,
  markedIds,
  currentIndex,
  allowBack,
  saving,
  submitting,
  onSelect,
  onSubmitClick,
}) {
  const { t } = useTranslation('student')
  const lowTime = remainingSeconds > 0 && remainingSeconds <= 300

  return (
    <aside className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E5E9EB] md:p-5">
      <div
        className={`mb-5 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 ${
          lowTime ? 'bg-[#FEF2F2]' : 'bg-[#FFF5F5]'
        }`}
      >
        <Clock3 className={`h-5 w-5 ${lowTime ? 'text-[#DC2626]' : 'text-[#F87171]'}`} />
        <span
          className={`font-mono text-xl font-extrabold tracking-widest ${
            lowTime ? 'text-[#DC2626]' : 'text-[#EF4444]'
          }`}
        >
          {formatCountdownSpaced(remainingSeconds)}
        </span>
      </div>

      <h2 className="mb-3 text-sm font-extrabold text-[#2A3433]">{t('attempt.questionIndex')}</h2>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const answered = isAnswerProvided(
            answersMap[question.test_question_id],
            question.snapshot_type_code,
          )
          const active = index === currentIndex
          const marked = markedIds.has(question.test_question_id)
          const disabled = !allowBack && index < currentIndex

          let cellClass =
            'relative flex h-10 items-center justify-center rounded-xl text-sm font-extrabold transition'

          if (active) {
            cellClass += ' bg-[#2AA8A2] text-white ring-2 ring-[#2AA8A2] ring-offset-1'
          } else if (answered) {
            cellClass += ' bg-[#2AA8A2] text-white'
          } else {
            cellClass += ' bg-[#D9E5E3] text-[#64748B]'
          }

          return (
            <button
              key={question.test_question_id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`${cellClass} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {String(index + 1).padStart(2, '0')}
              {marked ? (
                <Bookmark
                  className="absolute -left-0.5 -top-1 h-3.5 w-3.5 fill-[#F472B6] text-[#EC4899]"
                  strokeWidth={2}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-5 space-y-2 border-t border-[#EEF2F4] pt-4 text-xs font-semibold text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#2AA8A2]" />
          {t('attempt.legendAnswered')}
        </div>
        <div className="flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 fill-[#F472B6] text-[#EC4899]" />
          {t('attempt.legendMarked')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#D9E5E3]" />
          {t('attempt.legendRemaining')}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#FFFBEB] px-3 py-3 ring-1 ring-[#FDE68A]">
        <div className="flex items-start gap-2">
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
          <p className="text-xs font-semibold leading-6 text-[#92400E]">{t('attempt.markHint')}</p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onSubmitClick}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2AA8A2] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(42,168,162,0.25)] disabled:opacity-60"
        >
          {submitting ? t('attempt.submitting') : t('attempt.submit')}
          {saving ? ` · ${t('attempt.saving')}` : ''}
        </button>
      </div>
    </aside>
  )
}

function AttemptFooter({
  allowBack,
  isFirst,
  isLast,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}) {
  const { t } = useTranslation('student')

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F4] pt-5">
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#2AA8A2] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {submitting ? t('attempt.submitting') : t('attempt.submit')}
      </button>

      <div className="hidden items-center gap-1.5 text-xs font-semibold text-[#94A3B8] sm:flex">
        <CircleHelp className="h-4 w-4" />
        {t('attempt.footerHelp')}
      </div>

      <div className="flex items-center gap-2">
        {allowBack ? (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirst || submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#EEF2F4] px-5 py-3 text-sm font-bold text-[#64748B] disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
            {t('attempt.previous')}
          </button>
        ) : null}

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2AA8A2] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {t('attempt.finish')}
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2AA8A2] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {t('attempt.next')}
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export { AttemptExamHeader, AttemptSidebar, AttemptFooter }
