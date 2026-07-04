import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { getTestQuestionsCount, getTestTotalPoints } from '../../../lib/testDisplay'
import { getTestName } from '../../../lib/testModel'
import ExamRandomGeneratedQuestionsPanel from '../ExamRandomGeneratedQuestionsPanel'

function ExamReviewStep({ test, onNext, onBack, onSaveDraft, savingDraft = false }) {
  const questions = test?.questions || []
  const totalPoints = getTestTotalPoints(test)
  const displayQuestionsCount = getTestQuestionsCount(test)

  return (
    <div className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">المراجعة النهائية</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          مراجعة الامتحان
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          راجع تفاصيل الامتحان والأسئلة قبل الانتقال إلى خطوة النشر.
        </p>
      </header>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="mb-5 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#2AA8A2]" />
          <h3 className="text-base font-extrabold text-[#2A3433]">ملخص الامتحان</h3>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">اسم الامتحان</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{getTestName(test)}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">عدد الأسئلة</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{displayQuestionsCount}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">مجموع الدرجات</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{totalPoints}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">المدة</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{test?.duration_minutes || '—'} دقيقة</dd>
          </div>
        </dl>
      </div>

      {questions.length > 0 ? (
        <ExamRandomGeneratedQuestionsPanel
          embedded
          questions={questions}
          sectionTitle="قائمة الأسئلة"
          continueLabel="التالي — النشر"
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onContinue={onNext}
          savingDraft={savingDraft}
        />
      ) : (
        <div className="sticky bottom-0 z-10 rounded-2xl border border-[#E5E9EB] bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] disabled:opacity-50"
            >
              {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white"
            >
              التالي — النشر
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamReviewStep
