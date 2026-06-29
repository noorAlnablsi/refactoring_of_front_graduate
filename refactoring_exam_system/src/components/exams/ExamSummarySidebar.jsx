import { Sparkles } from 'lucide-react'
import { TEST_STATUS } from '../../constants/tests'
import { getTestQuestionsCount } from '../../lib/testDisplay'
import { getTestName } from '../../lib/testModel'
import ExamStatusBadge from './ExamStatusBadge'

function ExamSummarySidebar({ test, draft, currentStep }) {
  const questionsCount = getTestQuestionsCount(test)
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

      <aside className="rounded-2xl bg-[#E8F7F6] p-5 ring-1 ring-[#CFECE9]">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2AA8A2]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[#2A3433]">مساعد الذكاء الاصطناعي</p>
            <p className="mt-1 text-xs leading-6 text-[#64748B]">
              يمكنك لاحقاً توليد أسئلة تلقائياً بناءً على المادة والوصف المُدخل.
            </p>
          </div>
        </div>
      </aside>

      <p className="text-center text-xs text-[#94A3B8]">الخطوة {currentStep} من 5</p>
    </div>
  )
}

export default ExamSummarySidebar
