import { useEffect, useState } from 'react'
import { BookOpen, FileSpreadsheet, PenLine, Shuffle, Sparkles } from 'lucide-react'
import { getDifficultyLabel, getQuestionTypeLabel } from '../../../lib/questionBanks'
import { getSourceTypeLabel } from '../../../lib/testDisplay'
import { getTestId } from '../../../lib/testModel'
import AddFromBankModal from '../AddFromBankModal'
import AddRandomBanksModal from '../AddRandomBanksModal'
import ExamManualQuestionsPanel from '../ExamManualQuestionsPanel'

const METHODS = [
  {
    id: 'from-bank',
    title: 'من بنك الأسئلة',
    description: 'اختر أسئلة محددة من بنك واحد',
    icon: BookOpen,
    enabled: true,
  },
  {
    id: 'random',
    title: 'عشوائي من البنوك',
    description: 'اختر أسئلة عشوائية من بنك أو أكثر',
    icon: Shuffle,
    enabled: true,
  },
  {
    id: 'manual',
    title: 'إنشاء يدوي',
    description: 'أنشئ أسئلة جديدة خاصة بهذا الامتحان',
    icon: PenLine,
    enabled: true,
  },
  {
    id: 'csv',
    title: 'استيراد CSV',
    description: 'قريباً — استيراد أسئلة من ملف',
    icon: FileSpreadsheet,
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'ai',
    title: 'توليد بالذكاء الاصطناعي',
    description: 'قريباً — توليد أسئلة تلقائياً',
    icon: Sparkles,
    enabled: false,
    comingSoon: true,
  },
]

function ExamAddQuestionsStep({ test, onRefresh, onNext, onBack }) {
  const [activeMethod, setActiveMethod] = useState(null)
  const [fromBankOpen, setFromBankOpen] = useState(false)
  const [randomOpen, setRandomOpen] = useState(false)
  const testId = getTestId(test)
  const questions = test?.questions || []

  useEffect(() => {
    if (activeMethod === 'from-bank') setFromBankOpen(true)
    if (activeMethod === 'random') setRandomOpen(true)
  }, [activeMethod])

  const handleNext = () => {
    if (questions.length < 1) return
    onNext?.()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">إضافة الأسئلة</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          اختر طريقة إضافة الأسئلة. يجب إضافة سؤال واحد على الأقل للمتابعة.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map(({ id, title, description, icon: Icon, enabled, comingSoon }) => (
            <button
              key={id}
              type="button"
              disabled={!enabled}
              onClick={() => enabled && setActiveMethod(id)}
              className={`relative rounded-2xl border p-4 text-right transition ${
                enabled
                  ? 'border-[#E5E9EB] hover:border-[#2AA8A2] hover:bg-[#F8FDFC]'
                  : 'cursor-not-allowed border-[#F1F5F9] bg-[#FAFBFC] opacity-70'
              } ${activeMethod === id ? 'border-[#2AA8A2] bg-[#E8F7F6]' : ''}`}
            >
              {comingSoon ? (
                <span className="absolute left-3 top-3 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#94A3B8]">
                  قريباً
                </span>
              ) : null}
              <Icon className="h-6 w-6 text-[#2AA8A2]" />
              <p className="mt-3 text-sm font-extrabold text-[#2A3433]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {activeMethod === 'manual' ? (
        <ExamManualQuestionsPanel testId={testId} onSuccess={onRefresh} />
      ) : null}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-[#2A3433]">
            أسئلة الامتحان ({questions.length})
          </h3>
          {questions.length < 1 ? (
            <span className="text-xs font-semibold text-red-600">مطلوب سؤال واحد على الأقل</span>
          ) : null}
        </div>

        {questions.length === 0 ? (
          <p className="mt-4 text-sm text-[#94A3B8]">لم تُضف أي أسئلة بعد.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {questions.map((question, index) => (
              <li
                key={question.id}
                className="rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#64748B]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#2AA8A2]">س{index + 1}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">
                    {getQuestionTypeLabel(question.snapshot_type_code)}
                  </span>
                  <span className="text-xs">{getDifficultyLabel(question.snapshot_difficulty)}</span>
                  <span className="text-xs">· {question.snapshot_points} درجة</span>
                  <span className="text-xs text-[#94A3B8]">
                    · {getSourceTypeLabel(question.source_type)}
                  </span>
                </div>
                <div
                  className="mt-2 line-clamp-2 text-[#374151]"
                  dangerouslySetInnerHTML={{ __html: question.snapshot_question_text || '' }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={questions.length < 1}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          التالي — الإعدادات
        </button>
      </div>

      <AddFromBankModal
        open={fromBankOpen}
        testId={testId}
        onClose={() => {
          setFromBankOpen(false)
          setActiveMethod(null)
        }}
        onSuccess={() => {
          setFromBankOpen(false)
          setActiveMethod(null)
          onRefresh?.()
        }}
      />

      <AddRandomBanksModal
        open={randomOpen}
        testId={testId}
        onClose={() => {
          setRandomOpen(false)
          setActiveMethod(null)
        }}
        onSuccess={() => {
          setRandomOpen(false)
          setActiveMethod(null)
          onRefresh?.()
        }}
      />
    </div>
  )
}

export default ExamAddQuestionsStep
