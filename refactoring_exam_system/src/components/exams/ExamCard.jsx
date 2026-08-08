import {
  Activity,
  Archive,
  ClipboardCheck,
  Clock,
  Edit3,
  FileText,
  Lock,
  Trash2,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS } from '../../constants/tests'
import { formatDate } from '../../lib/questionBanks'
import { canEditTest, canShowCloseExamButton, getTestQuestionsCount, getTestTotalPoints } from '../../lib/testDisplay'
import { getTestId, getTestName } from '../../lib/testModel'
import { getResumeWizardStep, getExamWizardProgress } from '../../lib/examWizardProgress'
import {
  shellAccentButtonClass,
  shellAccentSoftButtonClass,
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellDividerClass,
  shellGhostButtonClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import ExamStatusBadge from './ExamStatusBadge'

function ExamCard({ test, onArchive, onClose, onDelete }) {
  const { t } = useTranslation('exams')
  const navigate = useNavigate()
  const questionsCount = getTestQuestionsCount(test)
  const totalPoints = getTestTotalPoints(test)
  const isDraft = test.status === TEST_STATUS.DRAFT
  const isPublished = test.status === TEST_STATUS.PUBLISHED
  const isClosed = test.status === TEST_STATUS.CLOSED
  const editable = canEditTest(test)
  const testId = getTestId(test)

  const showContinue = isDraft
  const showEdit = editable && !isDraft
  const showGrade = isPublished || isClosed
  const showMonitor = isPublished
  const showClose = canShowCloseExamButton(test)
  const showDelete = isDraft
  const showArchive = test.status !== TEST_STATUS.ARCHIVED

  const hasPrimaryRow = showContinue || showGrade || showMonitor || (showEdit && !showGrade)
  const hasStartUtils = (showEdit && showGrade) || showClose
  const hasEndUtils = showDelete || showArchive
  const hasUtilityRow = hasStartUtils || hasEndUtils

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

  const primaryButtonClass = `w-full justify-center ${shellAccentButtonClass} h-10 px-3 py-2 text-xs`
  const softButtonClass = `w-full justify-center ${shellAccentSoftButtonClass} h-10 px-3`
  const ghostButtonClass = `inline-flex h-9 items-center gap-1.5 ${shellGhostButtonClass}`
  const dangerButtonClass =
    'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-danger-bg)]'

  const primaryGridClass =
    showGrade && showMonitor ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 gap-2'

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
      </div>

      {test.starts_at ? (
        <p className={`mt-2 ${shellSubtleTextClass}`}>
          {t('card.startsAt', { date: formatDate(test.starts_at) })}
        </p>
      ) : null}

      <div className={`mt-auto flex flex-col gap-2 border-t pt-4 ${shellDividerClass}`}>
        {hasPrimaryRow ? (
          <div className={primaryGridClass}>
            {showContinue ? (
              <button type="button" onClick={handleContinue} className={primaryButtonClass}>
                <Edit3 className="h-3.5 w-3.5 shrink-0" />
                {t('card.continueEditing')}
              </button>
            ) : null}

            {showEdit && !showGrade ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.EXAM_EDIT.replace(':id', testId))}
                className={softButtonClass}
              >
                <Edit3 className="h-3.5 w-3.5 shrink-0" />
                {t('card.edit')}
              </button>
            ) : null}

            {showGrade ? (
              <button type="button" onClick={openAttempts} className={primaryButtonClass}>
                <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />
                {t('card.gradeAttempts')}
              </button>
            ) : null}

            {showMonitor ? (
              <button type="button" onClick={openMonitoring} className={softButtonClass}>
                <Activity className="h-3.5 w-3.5 shrink-0" />
                {t('card.liveMonitoring')}
              </button>
            ) : null}
          </div>
        ) : null}

        {hasUtilityRow ? (
          <div
            className={`flex items-center gap-2 ${
              hasStartUtils ? 'justify-between' : 'justify-end'
            }`}
          >
            {hasStartUtils ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {showEdit && showGrade ? (
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.EXAM_EDIT.replace(':id', testId))}
                    className={ghostButtonClass}
                  >
                    <Edit3 className="h-3.5 w-3.5 shrink-0" />
                    {t('card.edit')}
                  </button>
                ) : null}

                {showClose ? (
                  <button type="button" onClick={() => onClose?.(test)} className={ghostButtonClass}>
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    {t('card.closeExam')}
                  </button>
                ) : null}
              </div>
            ) : null}

            {hasEndUtils ? (
              <div className="flex shrink-0 items-center gap-1">
                {showDelete ? (
                  <button type="button" onClick={() => onDelete?.(test)} className={dangerButtonClass}>
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    {t('card.delete')}
                  </button>
                ) : null}

                {showArchive ? (
                  <button
                    type="button"
                    onClick={() => onArchive?.(test)}
                    className={dangerButtonClass}
                  >
                    <Archive className="h-3.5 w-3.5 shrink-0" />
                    {t('card.archive')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default ExamCard
