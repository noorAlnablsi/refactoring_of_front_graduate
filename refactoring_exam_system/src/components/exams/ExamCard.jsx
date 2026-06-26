import { Archive, Clock, Edit3, FileText, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS } from '../../constants/tests'
import { formatDate } from '../../lib/questionBanks'
import { canEditTest, getTestQuestionsCount, getTestTotalPoints } from '../../lib/testDisplay'
import { getTestId, getTestName } from '../../lib/testModel'
import ExamStatusBadge from './ExamStatusBadge'

function ExamCard({ test, onArchive, onClose }) {
  const navigate = useNavigate()
  const questionsCount = getTestQuestionsCount(test)
  const totalPoints = getTestTotalPoints(test)
  const isDraft = test.status === TEST_STATUS.DRAFT
  const isPublished = test.status === TEST_STATUS.PUBLISHED
  const editable = canEditTest(test)

  const handleContinue = () => {
    const step = questionsCount > 0 ? 2 : 1
    navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(test)) + `?step=${step}`)
  }

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-[#E5E9EB] transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold text-[#2A3433]">{getTestName(test) || 'بدون عنوان'}</h3>
          {test.subject_name ? (
            <p className="mt-1 text-sm text-[#64748B]">{test.subject_name}</p>
          ) : null}
        </div>
        <ExamStatusBadge status={test.status} />
      </div>

      {test.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#64748B]">{test.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[#94A3B8]">
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
        <p className="mt-2 text-xs text-[#94A3B8]">يبدأ: {formatDate(test.starts_at)}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E5E9EB] pt-4">
        {isDraft ? (
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2AA8A2] px-4 py-2 text-xs font-bold text-white"
          >
            <Edit3 className="h-3.5 w-3.5" />
            متابعة التحرير
          </button>
        ) : editable ? (
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(test)))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8F7F6] px-4 py-2 text-xs font-bold text-[#2AA8A2]"
          >
            <Edit3 className="h-3.5 w-3.5" />
            تعديل
          </button>
        ) : null}

        {isPublished ? (
          <button
            type="button"
            onClick={() => onClose?.(test)}
            className="rounded-xl bg-[#F6F8F9] px-4 py-2 text-xs font-bold text-[#64748B]"
          >
            إغلاق الامتحان
          </button>
        ) : null}

        {test.status !== TEST_STATUS.ARCHIVED ? (
          <button
            type="button"
            onClick={() => onArchive?.(test)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
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
