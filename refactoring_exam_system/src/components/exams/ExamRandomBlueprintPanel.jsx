import { ArrowLeft, ArrowRight } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import BlueprintBanksEditor from './blueprint/BlueprintBanksEditor'
import BlueprintHealthSidebar from './blueprint/BlueprintHealthSidebar'
import { useRandomBlueprint } from '../../hooks/exams/useRandomBlueprint'

function ExamRandomBlueprintPanel({
  test,
  testId,
  banks,
  initialBlueprints = null,
  onBack,
  onAddBanks,
  onSaveDraft,
  onSuccess,
  savingDraft = false,
}) {
  const {
    blueprints,
    loading,
    submitting,
    health,
    blueprintQuestionsCount,
    updateBank,
    updateTopic,
    updateTopicDifficulty,
    handleGenerate,
  } = useRandomBlueprint({ banks, initialBlueprints, testId, onSuccess })

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#94A3B8]">جاري تحميل مخطط الاختبار...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-4">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">بناء المعايير الأكاديمية</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          مخطط الاختبار (Blueprint)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B] md:text-[15px]">
          قم بتحديد توزيع الأسئلة عبر بنوك المعرفة المختلفة. سيتم حساب الأوزان النسبية وتوزيع مستويات
          الصعوبة بشكل آلي لضمان توازن التقييم.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <BlueprintBanksEditor
          blueprints={blueprints}
          onUpdateBank={updateBank}
          onUpdateTopic={updateTopic}
          onUpdateTopicDifficulty={updateTopicDifficulty}
          onAddBanks={onAddBanks}
        />

        <BlueprintHealthSidebar
          test={test}
          health={health}
          blueprintQuestionsCount={blueprintQuestionsCount}
        />
      </div>

      <ExamWizardFooter className="-mx-1 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B] transition hover:bg-[#EEF2F3]"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onSaveDraft?.(blueprints)}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] transition hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={submitting || !health.isValid}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'جاري التوليد...' : 'توليد الاختبار'}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamRandomBlueprintPanel
