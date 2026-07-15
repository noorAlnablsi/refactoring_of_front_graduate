import { useTranslation } from 'react-i18next'
import { BarChart3, Check, X } from 'lucide-react'
import ExamSummarySidebar from '../ExamSummarySidebar'

function HealthRow({ label, ok }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          ok ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#FEE2E2] text-[#EF4444]'
        }`}
      >
        {ok ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <X className="h-4 w-4" strokeWidth={2.5} />}
      </span>
    </div>
  )
}

function BlueprintHealthSidebar({ test, health, blueprintQuestionsCount }) {
  const { t } = useTranslation('exams')

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] ring-1 ring-[#E5E9EB]">
        <div className="flex items-center justify-start gap-2">
          <BarChart3 className="h-4 w-4 text-[#2AA8A2]" strokeWidth={2.2} />
          <h3 className="text-sm font-extrabold text-[#2A3433]">{t('blueprint.healthTitle')}</h3>
        </div>
        <div className="mt-5 space-y-4">
          <HealthRow label={t('blueprint.weightsComplete')} ok={health.weightsValid} />
          <HealthRow label={t('blueprint.difficultyBalanced')} ok={health.difficultyValid} />
        </div>
      </div>

      <ExamSummarySidebar
        test={test}
        questionsCountOverride={blueprintQuestionsCount}
        showStepIndicator={false}
      />
    </aside>
  )
}

export default BlueprintHealthSidebar
