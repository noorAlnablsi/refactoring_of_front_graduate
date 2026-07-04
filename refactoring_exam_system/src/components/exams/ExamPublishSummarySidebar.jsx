import { BookOpen, CheckCircle2, ClipboardList, Eye, Sparkles } from 'lucide-react'
import { getTestQuestionsCount, getTestTotalPoints } from '../../lib/testDisplay'
import { isAiMonitoringActive } from '../../lib/testSettings'

function SummaryStatCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#F6F8F9] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#94A3B8]">{label}</p>
          <p
            className={`mt-1 text-sm font-extrabold leading-6 ${
              highlight ? 'text-[#2AA8A2]' : 'text-[#2A3433]'
            }`}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-[#E5E9EB]">
            <Icon className="h-4 w-4 text-[#2AA8A2]" strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ExamPublishSummarySidebar({ test, settings }) {
  const questionsCount = getTestQuestionsCount(test)
  const totalPoints = test?.total_score ?? getTestTotalPoints(test)
  const subjectName = test?.subject_name || '—'
  const monitoringActive = isAiMonitoringActive(settings || test?.settings_config)

  return (
    <div className="space-y-4">
      <aside className="rounded-2xl bg-white p-5 ring-1 ring-[#E5E9EB]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-[#2A3433]">ملخص نهائي</h3>
          <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            جاهز للنشر
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryStatCard
            icon={ClipboardList}
            label="إجمالي الأسئلة"
            value={`${questionsCount} سؤال`}
            highlight
          />
          <SummaryStatCard
            icon={Sparkles}
            label="مجموع الدرجات"
            value={`${totalPoints} نقطة`}
            highlight
          />
          <SummaryStatCard icon={BookOpen} label="المادة الدراسية" value={subjectName} />
          <SummaryStatCard
            icon={Eye}
            label="حالة المراقبة"
            value={monitoringActive ? 'نشط' : 'معطّل'}
            highlight={monitoringActive}
          />
        </div>
      </aside>

      <div className="rounded-2xl border border-dashed border-[#CFECE9] bg-[#F8FDFC] p-5">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7F6]">
            <CheckCircle2 className="h-6 w-6 text-[#2AA8A2]" strokeWidth={2.2} />
          </span>
          <p className="mt-4 text-sm font-extrabold text-[#2A3433]">كل شيء يبدو رائعاً!</p>
          <p className="mt-2 text-xs leading-7 text-[#64748B]">
            تمت مراجعة جميع الإعدادات والتأكد من صحة الأسئلة. يمكنك الآن مشاركة الرابط مع طلابك.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ExamPublishSummarySidebar
