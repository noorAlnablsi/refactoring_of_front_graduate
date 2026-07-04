import { TEST_STATUS } from '../../constants/tests'
import { getTestQuestionsCount } from '../../lib/testDisplay'
import { getTestName } from '../../lib/testModel'
import ExamStatusBadge from './ExamStatusBadge'

function ExamSummarySidebar({
  test,
  draft,
  currentStep,
  questionsCountOverride,
  showStepIndicator = true,
}) {
  const questionsCount =
    questionsCountOverride != null ? questionsCountOverride : getTestQuestionsCount(test)
  const totalScore = test?.total_score ?? draft?.total_score ?? 0
  const duration = test?.duration_minutes ?? draft?.duration_minutes
  const status = test?.status || TEST_STATUS.DRAFT

  return (
    <div className="space-y-4">
      <aside className="rounded-2xl bg-white p-5 ring-1 ring-[#E5E9EB]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-[#2A3433]">ملخص الامتحان</h3>
          <ExamStatusBadge status={status} />
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">عدد الأسئلة</dt>
            <dd className="font-extrabold text-[#2A3433]">{questionsCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">الدرجة الكلية</dt>
            <dd className="font-extrabold text-[#2A3433]">{totalScore || 0}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">الوقت المقدر</dt>
            <dd className="font-extrabold text-[#2A3433]">
              {duration ? `${duration} دقيقة` : '— دقيقة'}
            </dd>
          </div>
        </dl>

        {getTestName(test) || draft?.name ? (
          <div className="mt-5 border-t border-[#E5E9EB] pt-4">
            <p className="text-xs font-semibold text-[#94A3B8]">اسم الاختبار</p>
            <p className="mt-1 text-sm font-bold text-[#2A3433]">{getTestName(test) || draft?.name}</p>
          </div>
        ) : null}
      </aside>

      {showStepIndicator && currentStep ? (
        <p className="text-center text-xs text-[#94A3B8]">الخطوة {currentStep} من 5</p>
      ) : null}
    </div>
  )
}

export default ExamSummarySidebar
