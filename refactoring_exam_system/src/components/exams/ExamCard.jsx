import { Archive, Clock, Edit3, FileText, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS } from '../../constants/tests'
import { formatDate } from '../../lib/questionBanks'
import { canEditTest, getTestQuestionsCount, getTestTotalPoints } from '../../lib/testDisplay'
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

function ExamCard({ test, onArchive, onClose }) {
  const navigate = useNavigate()
  const questionsCount = getTestQuestionsCount(test)
  const totalPoints = getTestTotalPoints(test)
  const isDraft = test.status === TEST_STATUS.DRAFT
  const isPublished = test.status === TEST_STATUS.PUBLISHED
  const editable = canEditTest(test)

  const handleContinue = () => {
    const testId = getTestId(test)
    const progress = getExamWizardProgress(testId)
    const step = getResumeWizardStep(test, progress)
    navigate(ROUTES.EXAM_EDIT.replace(':id', testId) + `?step=${step}`)
  }

  return (
    <article className={`flex flex-col p-5 ${shellCardInteractiveClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-lg ${shellPageTitleClass}`}>{getTestName(test) || 'بدون عنوان'}</h3>
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
          {questionsCount} سؤال
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {test?.total_score ?? totalPoints} درجة
        </span>
        {test.duration_minutes ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {test.duration_minutes} دقيقة
          </span>
        ) : null}
      </div>

      {test.starts_at ? (
        <p className={`mt-2 ${shellSubtleTextClass}`}>يبدأ: {formatDate(test.starts_at)}</p>
      ) : null}

      <div className={`mt-5 flex flex-wrap gap-2 border-t pt-4 ${shellDividerClass}`}>
        {isDraft ? (
          <button type="button" onClick={handleContinue} className={`${shellAccentButtonClass} px-4 py-2 text-xs`}>
            <Edit3 className="h-3.5 w-3.5" />
            متابعة التحرير
          </button>
        ) : editable ? (
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(test)))}
            className={shellAccentSoftButtonClass}
          >
            <Edit3 className="h-3.5 w-3.5" />
            تعديل
          </button>
        ) : null}

        {isPublished ? (
          <button type="button" onClick={() => onClose?.(test)} className={shellGhostButtonClass}>
            إغلاق الامتحان
          </button>
        ) : null}

        {test.status !== TEST_STATUS.ARCHIVED ? (
          <button
            type="button"
            onClick={() => onArchive?.(test)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-danger-bg)]"
          >
            <Archive className="h-3.5 w-3.5" />
            أرشفة
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default ExamCard
