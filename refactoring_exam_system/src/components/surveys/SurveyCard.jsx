import {
  Archive,
  BarChart3,
  Copy,
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
import { canShowCloseExamButton, getTestQuestionsCount } from '../../lib/testDisplay'
import { getTestId, getTestName } from '../../lib/testModel'
import { getSurveyAudienceScope, getSurveyShareLink, getSurveyWizardEditPath } from '../../lib/surveys'
import { getExamWizardProgress, getResumeWizardStep } from '../../lib/examWizardProgress'
import { showAppToast } from '../../lib/appToast'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellDividerClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import ExamStatusBadge from '../exams/ExamStatusBadge'

function SurveyCard({ survey, onArchive, onClose, onDelete }) {
  const { t } = useTranslation('surveys')
  const navigate = useNavigate()
  const questionsCount = getTestQuestionsCount(survey)
  const isDraft = survey.status === TEST_STATUS.DRAFT
  const isPublished = survey.status === TEST_STATUS.PUBLISHED
  const isClosed = survey.status === TEST_STATUS.CLOSED
  const surveyId = getTestId(survey)
  const audience = getSurveyAudienceScope(survey)
  const showContinue = isDraft
  const showClose = canShowCloseExamButton(survey)
  const showDelete = isDraft || isClosed
  const showArchive = survey.status !== TEST_STATUS.ARCHIVED
  const showResponses = isPublished || isClosed

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getSurveyShareLink(survey))
      showAppToast('toast.linkCopied', 'success', { ns: 'surveys' })
    } catch {
      showAppToast('wizard.publish.linkCopyFailed', 'error', { ns: 'exams' })
    }
  }

  const handleContinue = () => {
    const progress = getExamWizardProgress(surveyId)
    const step = getResumeWizardStep(survey, progress)
    navigate(`${getSurveyWizardEditPath(surveyId)}?step=${step}`)
  }

  const handleViewResponses = () => {
    navigate(ROUTES.SURVEY_RESPONSES.replace(':id', String(surveyId)))
  }

  const primaryButtonClass = `w-full justify-center whitespace-normal text-center leading-tight ${shellAccentButtonClass} h-auto min-h-11 px-3 py-2.5 text-sm`
  const softAccentClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-accent)]/25 bg-[var(--shell-accent-bg)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-accent)] transition hover:bg-[var(--shell-accent-bg-strong)]'
  const neutralOutlineClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]'
  const dangerOutlineClass =
    'inline-flex h-auto min-h-11 w-full items-center justify-center gap-1.5 whitespace-normal rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2.5 text-center text-sm font-bold leading-tight text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-danger-bg)]'

  const publishedGrid = isPublished && showResponses

  return (
    <article className={`flex h-full flex-col p-6 ${shellCardInteractiveClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-lg ${shellPageTitleClass}`}>
            {getTestName(survey) || t('card.untitled')}
          </h3>
          <p className={`mt-1 ${shellBodyTextClass}`}>
            {survey.subject_name || t('card.noSubject')}
          </p>
        </div>
        <ExamStatusBadge status={survey.status} />
      </div>

      {survey.description ? (
        <p className={`mt-3 line-clamp-2 text-sm leading-6 ${shellBodyTextClass}`}>{survey.description}</p>
      ) : null}

      <div className={`mt-4 flex flex-wrap gap-4 text-xs font-semibold ${shellSubtleTextClass}`}>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {t('card.questions', { count: questionsCount })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {t(`audience.${audience.toLowerCase()}`)}
        </span>
      </div>

      <div className={`mt-6 flex flex-col gap-2.5 border-t pt-4 ${shellDividerClass}`}>
        {publishedGrid ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={handleCopyLink} className={primaryButtonClass}>
              <Copy className="h-4 w-4 shrink-0" />
              {t('card.copyLink')}
            </button>
            <button type="button" onClick={handleViewResponses} className={softAccentClass}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              {t('card.viewResponses')}
            </button>
            {showClose ? (
              <button type="button" onClick={() => onClose?.(survey)} className={neutralOutlineClass}>
                <Lock className="h-4 w-4 shrink-0" />
                {t('card.closeSurvey')}
              </button>
            ) : null}
            {showArchive ? (
              <button
                type="button"
                onClick={() => onArchive?.(survey)}
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

            {showResponses ? (
              <button type="button" onClick={handleViewResponses} className={neutralOutlineClass}>
                <BarChart3 className="h-4 w-4 shrink-0" />
                {t('card.viewResponses')}
              </button>
            ) : null}

            {showDelete && showArchive ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => onArchive?.(survey)} className={dangerOutlineClass}>
                  <Archive className="h-4 w-4 shrink-0" />
                  {t('card.archive')}
                </button>
                <button type="button" onClick={() => onDelete?.(survey)} className={dangerOutlineClass}>
                  <Trash2 className="h-4 w-4 shrink-0" />
                  {t('card.delete')}
                </button>
              </div>
            ) : showArchive ? (
              <button type="button" onClick={() => onArchive?.(survey)} className={dangerOutlineClass}>
                <Archive className="h-4 w-4 shrink-0" />
                {t('card.archive')}
              </button>
            ) : showDelete ? (
              <button type="button" onClick={() => onDelete?.(survey)} className={dangerOutlineClass}>
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

export default SurveyCard
