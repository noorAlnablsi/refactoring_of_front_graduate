import {
  Activity,
  Archive,
  ClipboardCheck,
  Clock,
  Edit3,
  FileText,
  Lock,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS } from '../../constants/tests'
import { formatDate } from '../../lib/questionBanks'
import {
  canShowCloseExamButton,
  getTestAverageScore,
  getTestParticipantsCount,
  getTestQuestionsCount,
  getTestTotalPoints,
} from '../../lib/testDisplay'
import { getTestId, getTestName } from '../../lib/testModel'
import { getResumeWizardStep, getExamWizardProgress } from '../../lib/examWizardProgress'
import { readProctoringEnabledFlag } from '../../lib/proctoring/isProctoringEnabled'
import { getTestById } from '../../services/tests.service'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellDividerClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import ExamStatusBadge from './ExamStatusBadge'

function ExamCard({ test, onArchive, onClose, onDelete }) {
  const { t } = useTranslation('exams')
  const navigate = useNavigate()
  const questionsCount = getTestQuestionsCount(test)
  const totalPoints = getTestTotalPoints(test)
  const participantsCount = getTestParticipantsCount(test)
  const averageScore = getTestAverageScore(test)
  const isDraft = test.status === TEST_STATUS.DRAFT
  const isPublished = test.status === TEST_STATUS.PUBLISHED
  const isClosed = test.status === TEST_STATUS.CLOSED
  const testId = getTestId(test)
  const listedProctoringFlag = readProctoringEnabledFlag(test)
  const [resolvedProctoringFlag, setResolvedProctoringFlag] = useState(null)

  useEffect(() => {
    if (!isPublished || listedProctoringFlag != null || !testId) {
      setResolvedProctoringFlag(null)
      return undefined
    }

    let cancelled = false
    getTestById(testId)
      .then((data) => {
        if (cancelled) return
        const details = data?.test || data
        setResolvedProctoringFlag(readProctoringEnabledFlag(details))
      })
      .catch(() => {
        if (!cancelled) setResolvedProctoringFlag(false)
      })

    return () => {
      cancelled = true
    }
  }, [isPublished, listedProctoringFlag, testId])

  const monitoringEnabled =
    listedProctoringFlag === true ||
    (listedProctoringFlag == null && resolvedProctoringFlag === true)

  const showContinue = isDraft
  const showGrade = isPublished || isClosed
  const showMonitor = isPublished && monitoringEnabled
  const showClose = canShowCloseExamButton(test)
  /** Draft + closed: archive | delete row (per design). Published: 2×2 grid. */
  const showDelete = isDraft || isClosed
  const showArchive = test.status !== TEST_STATUS.ARCHIVED

  const handleContinue = () => {
    const progress = getExamWizardProgress(testId)
    const step = getResumeWizardStep(test, progress)
    navigate(ROUTES.EXAM_EDIT.replace(':id', testId) + `?step=${step}`)
  }

  const openAttempts = () => {
    navigate(ROUTES.EXAM_ATTEMPTS.replace(':id', testId))
  }

  const openMonitoring = () => {
    navigate(ROUTES.EXAM_MONITORING.replace(':id', testId))
  }

  const primaryButtonClass = `w-full justify-center whitespace-normal text-center leading-tight ${shellAccentButtonClass} h-auto min-h-11 px-3 py-2.5 text-sm`
  const softMonitorClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-accent)]/25 bg-[var(--shell-accent-bg)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-accent)] transition hover:bg-[var(--shell-accent-bg-strong)]'
  const neutralOutlineClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]'
  const dangerOutlineClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-danger-bg)]'

  const publishedGrid = isPublished && showGrade

  return (
    <article className={`flex h-full flex-col p-5 ${shellCardInteractiveClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-lg ${shellPageTitleClass}`}>
            {getTestName(test) || t('card.untitled')}
          </h3>
          {test.subject_name ? <p className={`mt-1 ${shellBodyTextClass}`}>{test.subject_name}</p> : null}
        </div>
        <ExamStatusBadge status={test.status} />
      </div>

      {test.description ? (
        <p className={`mt-3 line-clamp-2 text-sm leading-6 ${shellBodyTextClass}`}>{test.description}</p>
      ) : null}

      <div className={`mt-4 flex flex-wrap gap-4 text-xs font-semibold ${shellSubtleTextClass}`}>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {t('card.questions', { count: questionsCount })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {t('card.points', { count: test?.total_score ?? totalPoints })}
        </span>
        {test.duration_minutes ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {t('card.minutes', { count: test.duration_minutes })}
          </span>
        ) : null}
        {participantsCount != null ? (
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            {t('card.participants', { count: participantsCount })}
          </span>
        ) : null}
        {averageScore != null ? (
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            {t('card.averageScore', { score: averageScore })}
          </span>
        ) : null}
      </div>

      {test.starts_at ? (
        <p className={`mt-2 ${shellSubtleTextClass}`}>
          {t('card.startsAt', { date: formatDate(test.starts_at) })}
        </p>
      ) : null}

      <div className={`mt-auto flex flex-col gap-2.5 border-t pt-4 ${shellDividerClass}`}>
        {publishedGrid ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={openAttempts}
              className={`${primaryButtonClass}${showMonitor ? '' : ' sm:col-span-2'}`}
            >
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              {t('card.gradeAttempts')}
            </button>
            {showMonitor ? (
              <button type="button" onClick={openMonitoring} className={softMonitorClass}>
                <Activity className="h-4 w-4 shrink-0" />
                {t('card.liveMonitoring')}
              </button>
            ) : null}
            {showClose ? (
              <button type="button" onClick={() => onClose?.(test)} className={neutralOutlineClass}>
                <Lock className="h-4 w-4 shrink-0" />
                {t('card.closeExam')}
              </button>
            ) : null}
            {showArchive ? (
              <button
                type="button"
                onClick={() => onArchive?.(test)}
                className={`${dangerOutlineClass}${!showClose ? ' sm:col-span-2' : ''}`}
              >
                <Archive className="h-4 w-4 shrink-0" />
                {t('card.archive')}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {showContinue ? (
              <button type="button" onClick={handleContinue} className={primaryButtonClass}>
                <Edit3 className="h-4 w-4 shrink-0" />
                {t('card.continueEditing')}
              </button>
            ) : null}

            {showGrade ? (
              <button type="button" onClick={openAttempts} className={primaryButtonClass}>
                <ClipboardCheck className="h-4 w-4 shrink-0" />
                {t('card.gradeAttempts')}
              </button>
            ) : null}

            {showDelete && showArchive ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button type="button" onClick={() => onArchive?.(test)} className={dangerOutlineClass}>
                  <Archive className="h-4 w-4 shrink-0" />
                  {t('card.archive')}
                </button>
                <button type="button" onClick={() => onDelete?.(test)} className={dangerOutlineClass}>
                  <Trash2 className="h-4 w-4 shrink-0" />
                  {t('card.delete')}
                </button>
              </div>
            ) : showArchive ? (
              <button type="button" onClick={() => onArchive?.(test)} className={dangerOutlineClass}>
                <Archive className="h-4 w-4 shrink-0" />
                {t('card.archive')}
              </button>
            ) : showDelete ? (
              <button type="button" onClick={() => onDelete?.(test)} className={dangerOutlineClass}>
                <Trash2 className="h-4 w-4 shrink-0" />
                {t('card.delete')}
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  )
}

export default ExamCard
