import { useTranslation } from 'react-i18next'
import { formatCountdown, isAnswerProvided } from '../../../lib/attemptAnswers'
import CameraPreview from '../../proctoring/CameraPreview'
import ProctoringWarning from '../../proctoring/ProctoringWarning'

function AttemptTopBar({
  examTitle,
  questionIndex,
  questionTotal,
  remainingSeconds,
  saving,
  submitting,
  proctoringRequired,
  cameraStream,
}) {
  const { t } = useTranslation('student')
  const lowTime = remainingSeconds > 0 && remainingSeconds <= 60

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E9EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-[#2A3433]">{examTitle || t('attempt.title')}</p>
          <p className="mt-0.5 text-xs font-semibold text-[#64748B]">
            {t('attempt.progress', { current: questionIndex + 1, total: questionTotal })}
            {saving ? ` · ${t('attempt.saving')}` : ''}
            {submitting ? ` · ${t('attempt.submitting')}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {proctoringRequired ? (
            <div className="hidden overflow-hidden rounded-lg ring-1 ring-[#E5E9EB] sm:block">
              <CameraPreview stream={cameraStream} className="h-12 w-16 object-cover" />
            </div>
          ) : null}

          <div
            className={`rounded-xl px-3 py-2 font-mono text-sm font-extrabold ${
              lowTime ? 'bg-[#FEF2F2] text-[#B91C1C]' : 'bg-[#F1F5F9] text-[#2A3433]'
            }`}
          >
            {formatCountdown(remainingSeconds)}
          </div>
        </div>
      </div>
    </header>
  )
}

function AttemptNavigator({
  questions,
  answersMap,
  currentIndex,
  allowBack,
  onSelect,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question, index) => {
        const answered = isAnswerProvided(
          answersMap[question.test_question_id],
          question.snapshot_type_code,
        )
        const active = index === currentIndex

        return (
          <button
            key={question.test_question_id}
            type="button"
            onClick={() => onSelect(index)}
            disabled={!allowBack && index < currentIndex}
            className={`h-9 w-9 rounded-lg text-xs font-bold transition ${
              active
                ? 'bg-[#2AA8A2] text-white'
                : answered
                  ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!allowBack || isFirst || submitting}
        className="rounded-xl bg-[#F1F5F9] px-5 py-3 text-sm font-bold text-[#64748B] disabled:opacity-50"
      >
        {t('attempt.previous')}
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? t('attempt.submitting') : t('attempt.submit')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {t('attempt.next')}
        </button>
      )}
    </div>
  )
}

export { AttemptTopBar, AttemptNavigator, AttemptFooter }
