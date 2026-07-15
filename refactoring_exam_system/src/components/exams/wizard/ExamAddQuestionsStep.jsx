import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EXAM_QUESTIONS_VIEWS } from '../../../lib/examWizardProgress'
import { getTestId } from '../../../lib/testModel'
import AddRandomBanksModal from '../AddRandomBanksModal'
import ExamAiGeneratePanel from '../ExamAiGeneratePanel'
import ExamCsvImportPanel from '../ExamCsvImportPanel'
import ExamManualQuestionsPanel from '../ExamManualQuestionsPanel'
import ExamPickBankQuestionsPanel from '../ExamPickBankQuestionsPanel'
import ExamRandomBlueprintPanel from '../ExamRandomBlueprintPanel'
import ExamRandomGeneratedQuestionsPanel from '../ExamRandomGeneratedQuestionsPanel'
import ExamQuestionsMethodPicker from './addQuestions/ExamQuestionsMethodPicker'
import { getExamQuestionsReviewSourceKey } from './addQuestions/examAddQuestionsConstants'
import { restoreExamQuestionsProgress } from './addQuestions/restoreExamQuestionsProgress'

function ExamAddQuestionsStep({
  test,
  onRefresh,
  onNext,
  onBack,
  onBlueprintActiveChange,
  onSaveDraftProgress,
  savingDraft = false,
}) {
  const { t } = useTranslation('exams')
  const [activeMethod, setActiveMethod] = useState(null)
  const [fromBankOpen, setFromBankOpen] = useState(false)
  const [randomOpen, setRandomOpen] = useState(false)
  const [selectedFromBank, setSelectedFromBank] = useState(null)
  const [fromBankSelectedIds, setFromBankSelectedIds] = useState([])
  const [showManualView, setShowManualView] = useState(false)
  const [showCsvView, setShowCsvView] = useState(false)
  const [showAiView, setShowAiView] = useState(false)
  const [blueprintBanks, setBlueprintBanks] = useState(null)
  const [restoredBlueprints, setRestoredBlueprints] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState(null)
  const [showGeneratedView, setShowGeneratedView] = useState(false)
  const [reviewSource, setReviewSource] = useState('exam')
  const [restoring, setRestoring] = useState(true)
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
    showCsvView ||
    showAiView ||
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
    if (activeMethod === 'csv') setShowCsvView(true)
    if (activeMethod === 'ai') setShowAiView(true)
  }, [activeMethod, blueprintBanks, selectedFromBank])

  useEffect(() => {
    let cancelled = false
    setRestoring(true)

    const applyRestore = async () => {
      try {
        const result = await restoreExamQuestionsProgress({
          testId,
          hasQuestions: (questions?.length || 0) > 0,
        })

        if (cancelled) return

        switch (result.kind) {
          case 'review':
            setReviewSource(result.reviewSource)
            setShowGeneratedView(true)
            break
          case 'from-bank':
            setSelectedFromBank(result.bank)
            setFromBankSelectedIds(result.selectedQuestionIds)
            setActiveMethod('from-bank')
            break
          case 'manual':
            setShowManualView(true)
            setActiveMethod('manual')
            break
          case 'random-blueprint':
            setBlueprintBanks(result.banks)
            setRestoredBlueprints(result.blueprints)
            setActiveMethod('random')
            break
          case 'idle':
          default:
            break
        }
      } catch {
        if (!cancelled) {
          setShowGeneratedView(false)
          setActiveMethod(null)
        }
      } finally {
        if (!cancelled) setRestoring(false)
      }
    }

    applyRestore()

    return () => {
      cancelled = true
    }
    // Only re-run when the exam identity changes — not on every questions length flicker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId])

  useEffect(() => {
    onBlueprintActiveChange?.(subFlowActive)
    return () => onBlueprintActiveChange?.(false)
  }, [subFlowActive, onBlueprintActiveChange])

  const resolveGeneratedQuestions = (nextQuestions) => {
    if (nextQuestions?.length) return nextQuestions
    return questions
  }

  const handleNext = () => {
    if (questions.length < 1) return
    onNext?.()
  }

  const openGeneratedReview = (source, nextQuestions) => {
    const list = resolveGeneratedQuestions(nextQuestions)
    if (!list.length) return
    setGeneratedQuestions(list)
    setReviewSource(source)
    setShowGeneratedView(true)
    setSelectedFromBank(null)
    setFromBankSelectedIds([])
        setShowManualView(false)
        setShowCsvView(false)
        setShowAiView(false)
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

  const reviewSourceKey = getExamQuestionsReviewSourceKey(reviewSource)
  const reviewCopy = useMemo(
    () => ({
      eyebrow: t(`wizard.questions.reviewSources.${reviewSourceKey}.eyebrow`),
      title: t(`wizard.questions.reviewSources.${reviewSourceKey}.title`),
      description: t(`wizard.questions.reviewSources.${reviewSourceKey}.description`),
      sectionTitle: t(`wizard.questions.reviewSources.${reviewSourceKey}.sectionTitle`),
    }),
    [reviewSourceKey, t],
  )

  if (restoring) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#94A3B8]">{t('wizard.restoringDraft')}</p>
      </div>
    )
  }

  if (showGeneratedView && questions.length) {
    return (
      <ExamRandomGeneratedQuestionsPanel
        questions={generatedQuestions?.length ? generatedQuestions : questions}
        testId={testId}
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
        onQuestionsChange={async () => {
          await onRefresh?.()
        }}
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
          openGeneratedReview('from-bank')
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
          openGeneratedReview('manual')
        }}
      />
    )
  }

  if (showCsvView) {
    return (
      <ExamCsvImportPanel
        testId={testId}
        savingDraft={savingDraft}
        onBack={() => {
          setShowCsvView(false)
          setActiveMethod(null)
        }}
        onSaveDraft={() =>
          saveQuestionsProgress({
            view: EXAM_QUESTIONS_VIEWS.REVIEW,
            reviewSource: 'exam',
          })
        }
        onSuccess={async () => {
          await onRefresh?.()
          openGeneratedReview('exam')
        }}
      />
    )
  }

  if (showAiView) {
    return (
      <ExamAiGeneratePanel
        test={test}
        testId={testId}
        savingDraft={savingDraft}
        onBack={() => {
          setShowAiView(false)
          setActiveMethod(null)
        }}
        onSaveDraft={() =>
          saveQuestionsProgress({
            view: EXAM_QUESTIONS_VIEWS.REVIEW,
            reviewSource: 'exam',
          })
        }
        onSuccess={async () => {
          await onRefresh?.()
          openGeneratedReview('exam')
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
            openGeneratedReview('random', nextQuestions)
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
    <ExamQuestionsMethodPicker
      test={test}
      activeMethod={activeMethod}
      onSelectMethod={setActiveMethod}
      questionsCount={questions.length}
      onBack={onBack}
      onNext={handleNext}
      fromBankOpen={fromBankOpen}
      randomOpen={randomOpen}
      onFromBankClose={() => {
        setFromBankOpen(false)
        setActiveMethod(null)
      }}
      onRandomClose={() => {
        setRandomOpen(false)
        setActiveMethod(null)
      }}
      onFromBankSelected={handleFromBankSelected}
      onRandomBanksSelected={handleBanksSelected}
    />
  )
}

export default ExamAddQuestionsStep
