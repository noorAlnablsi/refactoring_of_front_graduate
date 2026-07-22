import { AlertTriangle, ArrowLeft, BookOpen, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCountdownSpaced } from '../../../lib/attemptAnswers'

function AttemptSequentialHeader({ examTitle, remainingSeconds }) {
  const { t } = useTranslation('student')
  const lowTime = remainingSeconds > 0 && remainingSeconds <= 300

  return (
    <header className="border-b border-[#E5E9EB] bg-white">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
            lowTime ? 'bg-[#DC2626]' : 'bg-[#F87171]'
          }`}
        >
          <Clock3 className="h-4 w-4 text-white" />
          <span className="font-mono text-sm font-extrabold tracking-wider text-white">
            {formatCountdownSpaced(remainingSeconds)}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-[#2AA8A2]">
          <BookOpen className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <h1 className="truncate text-sm font-extrabold md:text-base">
            {examTitle || t('attempt.title')}
          </h1>
        </div>
      </div>
    </header>
  )
}

function AttemptSequentialProgress({ currentIndex, total, answeredCount }) {
  const { t } = useTranslation('student')
  const safeTotal = Math.max(1, total || 1)
  const percent = Math.min(100, Math.round((answeredCount / safeTotal) * 100))

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-6">
      <p className="text-center text-xs font-bold text-[#94A3B8]">{t('attempt.questionStatus')}</p>
      <h2 className="mt-2 text-center text-2xl font-extrabold text-[#2A3433] md:text-3xl">
        {t('attempt.progress', { current: currentIndex + 1, total })}
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E8EEF0]">
          <div
            className="h-full rounded-full bg-[#2AA8A2] transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-extrabold text-[#059669]">
          {t('attempt.completedPercent', { percent })}
        </span>
      </div>
    </section>
  )
}

function AttemptSequentialWarning() {
  const { t } = useTranslation('student')

  return (
    <div className="mx-auto mt-5 w-full max-w-4xl px-4 md:px-6">
      <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3.5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" strokeWidth={2.2} />
        <p className="text-sm font-semibold leading-7 text-[#991B1B]">
          {t('attempt.noBackWarning')}
        </p>
      </div>
    </div>
  )
}

function AttemptSequentialSessionCard({
  studentName,
  studentAvatarUrl,
  studentNumber,
  remainingSeconds,
  proctoringActive,
}) {
  const { t } = useTranslation('student')
  if (!studentName && !studentAvatarUrl) return null

  const initials = (studentName || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <aside className="fixed bottom-5 start-5 z-30 hidden w-[220px] rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(16,24,40,0.12)] ring-1 ring-[#E5E9EB] lg:block">
      <div className="flex items-center gap-3">
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
        <div className="min-w-0">
          {studentName ? (
            <p className="truncate text-sm font-extrabold text-[#2A3433]">{studentName}</p>
          ) : null}
          {studentNumber ? (
            <p className="truncate text-xs font-semibold text-[#94A3B8]">{studentNumber}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEF2F4] pt-3">
        <span className="text-xs font-bold text-[#64748B]">{t('attempt.sessionTime')}</span>
        <span className="font-mono text-xs font-extrabold text-[#DC2626]">
          {formatCountdownSpaced(remainingSeconds)}
        </span>
      </div>

      {proctoringActive ? (
        <p className="mt-2 text-[11px] font-bold text-[#2AA8A2]">{t('attempt.proctoringActive')}</p>
      ) : null}
    </aside>
  )
}

function AttemptSequentialFooter({ isLast, submitting, onNext, onSubmit }) {
  const { t } = useTranslation('student')

  return (
    <div className="mx-auto mt-6 flex w-full max-w-4xl justify-end px-4 pb-10 md:px-6">
      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#2AA8A2] px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(42,168,162,0.25)] disabled:opacity-60"
        >
          {submitting ? t('attempt.submitting') : t('attempt.finish')}
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#2AA8A2] px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(42,168,162,0.25)] disabled:opacity-60"
        >
          {t('attempt.nextQuestion')}
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export {
  AttemptSequentialHeader,
  AttemptSequentialProgress,
  AttemptSequentialWarning,
  AttemptSequentialSessionCard,
  AttemptSequentialFooter,
}
