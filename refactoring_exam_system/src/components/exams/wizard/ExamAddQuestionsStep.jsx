import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, FileSpreadsheet, PenLine, Shuffle, Sparkles } from 'lucide-react'
import {
  EXAM_QUESTIONS_VIEWS,
  getExamWizardProgress,
} from '../../../lib/examWizardProgress'
import { getTestId } from '../../../lib/testModel'
import { getQuestionBankById } from '../../../services/questionBanks.service'
import { getTestById } from '../../../services/tests.service'
import AddRandomBanksModal from '../AddRandomBanksModal'
import ExamManualQuestionsPanel from '../ExamManualQuestionsPanel'
import ExamPickBankQuestionsPanel from '../ExamPickBankQuestionsPanel'
import ExamRandomBlueprintPanel from '../ExamRandomBlueprintPanel'
import ExamRandomGeneratedQuestionsPanel from '../ExamRandomGeneratedQuestionsPanel'

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

const REVIEW_COPY = {
  random: {
    eyebrow: 'بناء المعايير الأكاديمية',
    title: 'مخطط الاختبار (Blueprint)',
    description: 'تم اختيار الأسئلة عشوائياً وفق النسب التي حددتها. راجعها ثم تابع.',
    sectionTitle: 'تكوين بنوك الأسئلة المختارة',
  },
  'from-bank': {
    eyebrow: 'من بنك الأسئلة',
    title: 'أسئلة الامتحان المختارة',
    description: 'راجع الأسئلة التي اخترتها من البنك قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
  manual: {
    eyebrow: 'إنشاء يدوي',
    title: 'أسئلة الامتحان',
    description: 'راجع الأسئلة التي أنشأتها يدوياً قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
  exam: {
    eyebrow: 'إضافة الأسئلة',
    title: 'أسئلة الامتحان',
    description: 'راجع أسئلة الامتحان قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
}

async function resolveBankById(bankId) {
  if (!bankId) return null
  try {
    const data = await getQuestionBankById(bankId)
    return data.question_bank || data
  } catch {
    return null
  }
}

async function resolveBanksByIds(bankIds = []) {
  const banks = await Promise.all(bankIds.map((bankId) => resolveBankById(bankId)))
  return banks.filter(Boolean)
}

function ExamAddQuestionsStep({
  test,
  onRefresh,
  onNext,
  onBack,
  onBlueprintActiveChange,
  onSaveDraftProgress,
  savingDraft = false,
}) {
  const [activeMethod, setActiveMethod] = useState(null)
  const [fromBankOpen, setFromBankOpen] = useState(false)
  const [randomOpen, setRandomOpen] = useState(false)
  const [selectedFromBank, setSelectedFromBank] = useState(null)
  const [fromBankSelectedIds, setFromBankSelectedIds] = useState([])
  const [showManualView, setShowManualView] = useState(false)
  const [blueprintBanks, setBlueprintBanks] = useState(null)
  const [restoredBlueprints, setRestoredBlueprints] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState(null)
  const [showGeneratedView, setShowGeneratedView] = useState(false)
  const [reviewSource, setReviewSource] = useState('exam')
  const [restoring, setRestoring] = useState(true)
  const restoredRef = useRef(false)
  const testId = getTestId(test)
  const questions = test?.questions || []
  const blueprintBankIds = useMemo(
    () => (blueprintBanks ? blueprintBanks.map((bank) => bank.id) : []),
    [blueprintBanks],
  )

  const subFlowActive =
    Boolean(blueprintBanks?.length) ||
    Boolean(selectedFromBank) ||
    showManualView ||
    showGeneratedView

  const saveQuestionsProgress = useCallback(
    (questionsProgress) => {
      onSaveDraftProgress?.({ questions: questionsProgress })
    },
    [onSaveDraftProgress],
  )

  useEffect(() => {
    if (activeMethod === 'from-bank' && !selectedFromBank) setFromBankOpen(true)
    if (activeMethod === 'random' && !blueprintBanks) setRandomOpen(true)
    if (activeMethod === 'manual') setShowManualView(true)
  }, [activeMethod, blueprintBanks, selectedFromBank])

  useEffect(() => {
    if (restoredRef.current) return undefined
    restoredRef.current = true

    let cancelled = false

    const restoreProgress = async () => {
      const progress = getExamWizardProgress(testId)
      const savedQuestions = progress?.questions

      if (!savedQuestions) {
        if (questions.length > 0) {
          setShowGeneratedView(true)
          setReviewSource('exam')
        }
        setRestoring(false)
        return
      }

      switch (savedQuestions.view) {
        case EXAM_QUESTIONS_VIEWS.REVIEW:
          setReviewSource(savedQuestions.reviewSource || 'exam')
          setShowGeneratedView(true)
          break
        case EXAM_QUESTIONS_VIEWS.FROM_BANK_QUESTIONS: {
          const bank = await resolveBankById(savedQuestions.bankId)
          if (!cancelled && bank) {
            setSelectedFromBank(bank)
            setFromBankSelectedIds(savedQuestions.selectedQuestionIds || [])
            setActiveMethod('from-bank')
          }
          break
        }
        case EXAM_QUESTIONS_VIEWS.MANUAL:
          setShowManualView(true)
          setActiveMethod('manual')
          break
        case EXAM_QUESTIONS_VIEWS.RANDOM_BLUEPRINT: {
          const banks = await resolveBanksByIds(savedQuestions.bankIds || [])
          if (!cancelled && banks.length) {
            setBlueprintBanks(banks)
            setRestoredBlueprints(savedQuestions.blueprints || null)
            setActiveMethod('random')
          }
          break
        }
        case EXAM_QUESTIONS_VIEWS.METHOD_PICKER:
        default:
          break
      }

      if (!cancelled) setRestoring(false)
    }

    restoreProgress()

    return () => {
      cancelled = true
    }
  }, [questions.length, testId])

  useEffect(() => {
    onBlueprintActiveChange?.(subFlowActive)
    return () => onBlueprintActiveChange?.(false)
  }, [subFlowActive, onBlueprintActiveChange])

  const resolveGeneratedQuestions = async (nextQuestions) => {
    if (nextQuestions?.length) return nextQuestions
    if (!testId) return []
    try {
      const data = await getTestById(testId)
      return (data.test || data).questions || []
    } catch {
      return []
    }
  }

  const handleNext = () => {
    if (questions.length < 1) return
    onNext?.()
  }

  const openGeneratedReview = async (source, nextQuestions) => {
    const list = await resolveGeneratedQuestions(nextQuestions)
    if (!list.length) return
    setGeneratedQuestions(list)
    setReviewSource(source)
    setShowGeneratedView(true)
    setSelectedFromBank(null)
    setFromBankSelectedIds([])
    setShowManualView(false)
    setBlueprintBanks(null)
    setRestoredBlueprints(null)
    setActiveMethod(null)
  }

  const handleBanksSelected = (banks) => {
    setBlueprintBanks(banks)
    setRestoredBlueprints(null)
    setActiveMethod('random')
    setRandomOpen(false)
  }

  const handleFromBankSelected = (banks) => {
    if (!banks?.length) return
    setSelectedFromBank(banks[0])
    setFromBankSelectedIds([])
    setActiveMethod('from-bank')
    setFromBankOpen(false)
  }

  const mergeBlueprintBanks = (banks) => {
    setBlueprintBanks((prev) => {
      if (!prev?.length) return banks

      const byId = new Map(prev.map((bank) => [bank.id, bank]))
      banks.forEach((bank) => {
        byId.set(bank.id, bank)
      })
      return [...byId.values()]
    })
  }

  const reviewCopy = REVIEW_COPY[reviewSource] || REVIEW_COPY.exam

  if (restoring) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#94A3B8]">جاري استعادة مسودة الامتحان...</p>
      </div>
    )
  }

  if (showGeneratedView && questions.length) {
    return (
      <ExamRandomGeneratedQuestionsPanel
        questions={generatedQuestions?.length ? generatedQuestions : questions}
        eyebrow={reviewCopy.eyebrow}
        title={reviewCopy.title}
        description={reviewCopy.description}
        sectionTitle={reviewCopy.sectionTitle}
        savingDraft={savingDraft}
        onBack={() => {
          setShowGeneratedView(false)
          setGeneratedQuestions(null)
        }}
        onSaveDraft={() =>
          saveQuestionsProgress({
            view: EXAM_QUESTIONS_VIEWS.REVIEW,
            reviewSource,
          })
        }
        onContinue={handleNext}
      />
    )
  }

  if (selectedFromBank) {
    return (
      <ExamPickBankQuestionsPanel
        bank={selectedFromBank}
        test={test}
        testId={testId}
        initialSelectedIds={fromBankSelectedIds}
        savingDraft={savingDraft}
        onBack={() => {
          setSelectedFromBank(null)
          setFromBankSelectedIds([])
          setActiveMethod(null)
        }}
        onSaveDraft={(selectedQuestionIds) =>
          saveQuestionsProgress({
            view: EXAM_QUESTIONS_VIEWS.FROM_BANK_QUESTIONS,
            bankId: selectedFromBank.id,
            selectedQuestionIds,
          })
        }
        onSuccess={async () => {
          await onRefresh?.()
          await openGeneratedReview('from-bank')
        }}
      />
    )
  }

  if (showManualView) {
    return (
      <ExamManualQuestionsPanel
        test={test}
        testId={testId}
        savingDraft={savingDraft}
        onBack={() => {
          setShowManualView(false)
          setActiveMethod(null)
        }}
        onSaveDraft={() =>
          saveQuestionsProgress({
            view: EXAM_QUESTIONS_VIEWS.MANUAL,
          })
        }
        onSuccess={onRefresh}
        onViewQuestions={async () => {
          await onRefresh?.()
          await openGeneratedReview('manual')
        }}
      />
    )
  }

  if (blueprintBanks?.length) {
    return (
      <>
        <ExamRandomBlueprintPanel
          test={test}
          testId={testId}
          banks={blueprintBanks}
          initialBlueprints={restoredBlueprints}
          savingDraft={savingDraft}
          onBack={() => {
            setBlueprintBanks(null)
            setRestoredBlueprints(null)
            setActiveMethod(null)
          }}
          onAddBanks={() => setRandomOpen(true)}
          onSaveDraft={(blueprints) =>
            saveQuestionsProgress({
              view: EXAM_QUESTIONS_VIEWS.RANDOM_BLUEPRINT,
              bankIds: blueprintBankIds,
              blueprints,
            })
          }
          onSuccess={async (nextQuestions) => {
            await openGeneratedReview('random', nextQuestions)
          }}
        />

        <AddRandomBanksModal
          open={randomOpen}
          subjectId={test?.subject_id}
          initialSelectedIds={blueprintBankIds}
          onClose={() => setRandomOpen(false)}
          onBanksSelected={mergeBlueprintBanks}
        />
      </>
    )
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

      <AddRandomBanksModal
        open={fromBankOpen}
        subjectId={test?.subject_id}
        selectionMode="single"
        onClose={() => {
          setFromBankOpen(false)
          setActiveMethod(null)
        }}
        onBanksSelected={handleFromBankSelected}
      />

      <AddRandomBanksModal
        open={randomOpen}
        subjectId={test?.subject_id}
        onClose={() => {
          setRandomOpen(false)
          setActiveMethod(null)
        }}
        onBanksSelected={handleBanksSelected}
      />
    </div>
  )
}

export default ExamAddQuestionsStep
