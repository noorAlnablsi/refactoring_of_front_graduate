import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookMarked, Clock3 } from 'lucide-react'
import ExamEntryCameraCard from '../../components/student/entry/ExamEntryCameraCard'
import ExamInformationCard from '../../components/student/entry/ExamInformationCard'
import ExamInstructionsCard from '../../components/student/entry/ExamInstructionsCard'
import StartExamButton from '../../components/student/entry/StartExamButton'
import SystemStatusGrid from '../../components/student/entry/SystemStatusGrid'
import { ROUTES } from '../../constants/routes'
import { resolveEntryInstructions } from '../../lib/entryInstructions'
import { useCamera } from '../../hooks/proctoring/useCamera'
import { useProctoring } from '../../hooks/proctoring/useProctoring'
import { useEntryEnvironmentCheck } from '../../hooks/student/useEntryEnvironmentCheck'
import { useExamEntry } from '../../hooks/student/useExamEntry'
import { useExamEntryStart } from '../../hooks/student/useExamEntryStart'

function ExamEntryPage() {
  const { testId } = useParams()
  const { t, i18n } = useTranslation('student')
  const { loading, error, entry, refetch } = useExamEntry(testId)
  const { stream, error: cameraError, permission, start, stop } = useCamera()
  const proctoring = useProctoring({ testId, autoStart: false })
  const [agreed, setAgreed] = useState(false)
  const [videoEl, setVideoEl] = useState(null)

  const proctoringEnabled = Boolean(entry?.rules?.proctoringEnabled)
  const live = Boolean(stream) && permission === 'granted'
  const { checks, allReady } = useEntryEnvironmentCheck({
    stream,
    videoElement: videoEl,
    enabled: proctoringEnabled && live,
  })

  const { startExam, starting, startError } = useExamEntryStart({
    testId,
    entry,
    proctoring,
    videoElement: videoEl,
  })

  useEffect(() => {
    if (!entry || !proctoringEnabled) return undefined

    let cancelled = false

    ;(async () => {
      try {
        await start({ video: true, audio: true })
      } catch {
        if (cancelled) return
      }
    })()

    return () => {
      cancelled = true
      stop()
    }
  }, [entry, proctoringEnabled, start, stop])

  const preflightReady = !proctoringEnabled || (live && allReady)
  const canNavigate =
    agreed && preflightReady && Boolean(entry?.mayProceed) && !loading && !error && !starting

  const handleStart = async () => {
    if (!canNavigate || !testId) return

    try {
      if (proctoringEnabled) {
        await stop()
      }
      await startExam()
    } catch {
      if (proctoringEnabled) {
        try {
          await start({ video: true, audio: true })
        } catch {
          // user can retry camera manually
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4" data-a11y-scale-root>
        <p className="text-sm font-semibold text-[#64748B]">{t('entry.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center"
        data-a11y-scale-root
      >
        <p className="text-sm font-semibold text-[#DC2626]">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={refetch}
            className="rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white"
          >
            {t('entry.retry')}
          </button>
          <Link to={ROUTES.STUDENT_DASHBOARD} className="text-sm font-bold text-[#2AA8A2]">
            {t('attempt.backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div
        className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center"
        data-a11y-scale-root
      >
        <p className="text-sm text-[#64748B]">{t('entry.empty')}</p>
        <Link to={ROUTES.STUDENT_DASHBOARD} className="text-sm font-bold text-[#2AA8A2]">
          {t('attempt.backToDashboard')}
        </Link>
      </div>
    )
  }

  const durationLabel =
    entry.time.durationMinutes != null
      ? t('entry.headerDuration', { minutes: entry.time.durationMinutes })
      : null

  const instructions = resolveEntryInstructions(entry.instructions, {
    language: i18n.language,
    t,
  })

  return (
    <div className="min-h-screen bg-[#F6F8F9] px-4 py-5 md:px-6 md:py-6" data-a11y-scale-root>
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7F6] text-[#2AA8A2]">
              <BookMarked className="h-5 w-5" />
            </span>
            <div className="min-w-0 text-start">
              <h1 className="truncate text-lg font-extrabold text-[#2A3433] md:text-xl">
                {entry.title}
              </h1>
              <p className="truncate text-sm text-[#64748B]">{entry.subjectLabel}</p>
            </div>
          </div>

          {durationLabel ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#2A3433] shadow-sm ring-1 ring-[#E5E9EB]">
              <Clock3 className="h-4 w-4 text-[#2AA8A2]" />
              {durationLabel}
            </span>
          ) : null}
        </header>

        {!entry.mayProceed ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
            {entry.blockReason === 'max_attempts'
              ? t('entry.blockedMaxAttempts', {
                  count: entry.rules.maxAttempts ?? 1,
                })
              : entry.blockReason === 'already_completed'
                ? t('entry.blockedAlreadyCompleted')
                : t('entry.cannotStart')}
          </div>
        ) : null}

        {startError ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {startError}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="space-y-4">
            <ExamEntryCameraCard
              stream={stream}
              live={live}
              checks={checks}
              cameraError={cameraError}
              proctoringEnabled={proctoringEnabled}
              onRetryCamera={() => start({ video: true, audio: true })}
              onVideoRef={setVideoEl}
            />
            <SystemStatusGrid checks={checks} proctoringEnabled={proctoringEnabled} />
            <StartExamButton
              disabled={!canNavigate}
              loading={starting}
              onClick={handleStart}
              isResume={Boolean(entry.student.resumeAttemptId || entry.student.alreadyStarted)}
            />
          </div>

          <div className="space-y-5">
            <ExamInformationCard entry={entry} />
            <ExamInstructionsCard
              instructions={instructions}
              agreed={agreed}
              onAgreedChange={setAgreed}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamEntryPage
