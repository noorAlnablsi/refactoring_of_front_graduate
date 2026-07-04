import { useCallback, useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExamSummarySidebar from '../../components/exams/ExamSummarySidebar'
import ExamPublishSummarySidebar from '../../components/exams/ExamPublishSummarySidebar'
import ExamSettingsSummarySidebar from '../../components/exams/ExamSettingsSummarySidebar'
import ExamWizardStepper from '../../components/exams/ExamWizardStepper'
import ExamAddQuestionsStep from '../../components/exams/wizard/ExamAddQuestionsStep'
import ExamBasicInfoStep from '../../components/exams/wizard/ExamBasicInfoStep'
import ExamPublishStep from '../../components/exams/wizard/ExamPublishStep'
import ExamReviewStep from '../../components/exams/wizard/ExamReviewStep'
import ExamSettingsStep from '../../components/exams/wizard/ExamSettingsStep'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS, TEST_WIZARD_STEPS } from '../../constants/tests'
import { canCreateExam, canAccessExams } from '../../lib/workspaceContext'
import { canEditTest, getEditBlockedMessage } from '../../lib/testDisplay'
import { getTestId, getTestName, mergeTestPreservingQuestions } from '../../lib/testModel'
import { buildUpdateTestInfoPayloadFromStep1 } from '../../lib/testPayload'
import {
  getResumeWizardStep,
  saveExamWizardProgress,
} from '../../lib/examWizardProgress'
import {
  createTest,
  getTestById,
  publishTestNow,
  scheduleTestPublication,
  updateTest,
} from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function parseStep(value) {
  const step = Number(value)
  if (step >= 1 && step <= 5) return step
  return TEST_WIZARD_STEPS.INFO
}

function ExamWizardPage({ isNew = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const showToast = useToastStore((s) => s.showToast)
  const currentStep = parseStep(searchParams.get('step'))
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [submitting, setSubmitting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [blueprintActive, setBlueprintActive] = useState(false)
  const [settingsPreview, setSettingsPreview] = useState(null)

  const goToStep = useCallback(
    (step) => {
      setSearchParams({ step: String(step) }, { replace: true })
      const testId = getTestId(test)
      if (testId && step !== TEST_WIZARD_STEPS.QUESTIONS) {
        saveExamWizardProgress(testId, { step, questions: null })
      }
    },
    [setSearchParams, test],
  )

  const handleSaveWizardDraftProgress = useCallback(
    async (step, extra = {}) => {
      const testId = getTestId(test)
      if (!testId) return

      setSavingDraft(true)
      try {
        saveExamWizardProgress(testId, { step, questions: null, ...extra })
        showToast('تم حفظ المسودة')
        navigate(ROUTES.EXAMS)
      } finally {
        setSavingDraft(false)
      }
    },
    [navigate, showToast, test],
  )

  const handleSaveSettingsDraft = useCallback(
    async (payload) => {
      const testId = getTestId(test)
      if (!testId) return

      setSavingDraft(true)
      try {
        const data = await updateTest(testId, payload)
        setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
        saveExamWizardProgress(testId, { step: TEST_WIZARD_STEPS.SETTINGS, questions: null })
        showToast('تم حفظ المسودة')
        navigate(ROUTES.EXAMS)
      } catch (err) {
        showToast(err.message, 'error')
      } finally {
        setSavingDraft(false)
      }
    },
    [navigate, showToast, test],
  )

  const handleSaveQuestionsDraftProgress = useCallback(
    async (progressSlice) => {
      const testId = getTestId(test)
      if (!testId) return

      setSavingDraft(true)
      try {
        saveExamWizardProgress(testId, {
          step: currentStep,
          ...progressSlice,
        })
        showToast('تم حفظ المسودة')
        navigate(ROUTES.EXAMS)
      } finally {
        setSavingDraft(false)
      }
    },
    [currentStep, navigate, showToast, test],
  )

  const loadTest = useCallback(async (silent = false) => {
    if (!id) return
    if (!silent) setLoading(true)
    try {
      const data = await getTestById(id)
      const fetched = data.test || data
      setTest((prev) => mergeTestPreservingQuestions(prev, fetched))

      if (!canEditTest(fetched) && fetched.status === TEST_STATUS.DRAFT) {
        const msg = getEditBlockedMessage(fetched)
        if (msg) showToast(msg, 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
      navigate(ROUTES.EXAMS, { replace: true })
    } finally {
      if (!silent) setLoading(false)
    }
  }, [id, navigate, showToast])

  useEffect(() => {
    if (!isNew && id) {
      loadTest()
    }
  }, [isNew, id, loadTest])

  if (!canAccessExams() || !canCreateExam()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const persistNewTest = async ({ create }) => {
    const data = await createTest(create)
    return data.test || data
  }

  const handleCreate = async (payload) => {
    setSubmitting(true)
    try {
      const created = await persistNewTest(payload)
      showToast('تم إنشاء الامتحان')
      navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(created)) + '?step=2', { replace: true })
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async (payload) => {
    setSavingDraft(true)
    try {
      if (isNew) {
        const created = await persistNewTest(payload)
        saveExamWizardProgress(getTestId(created), { step: TEST_WIZARD_STEPS.INFO })
        showToast('تم حفظ المسودة')
        navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(created)), { replace: true })
        return
      }
      const testId = getTestId(test)
      if (!testId) return
      const data = await updateTest(testId, buildUpdateTestInfoPayloadFromStep1(payload))
      setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
      saveExamWizardProgress(testId, { step: currentStep })
      showToast('تم حفظ المسودة')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleUpdateInfo = async (payload) => {
    const testId = getTestId(test)
    if (!testId) return
    setSubmitting(true)
    try {
      const data = await updateTest(testId, buildUpdateTestInfoPayloadFromStep1(payload))
      setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
      showToast('تم حفظ المعلومات')
      goToStep(TEST_WIZARD_STEPS.QUESTIONS)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSettings = async (payload) => {
    const testId = getTestId(test)
    if (!testId) return
    setSubmitting(true)
    try {
      const data = await updateTest(testId, payload)
      setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
      saveExamWizardProgress(testId, { step: TEST_WIZARD_STEPS.REVIEW, questions: null })
      showToast('تم حفظ الإعدادات')
      goToStep(TEST_WIZARD_STEPS.REVIEW)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublishNow = async () => {
    const testId = getTestId(test)
    if (!testId) return
    setPublishing(true)
    try {
      await publishTestNow(testId)
      showToast('تم نشر الامتحان بنجاح')
      navigate(ROUTES.EXAMS)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = async (payload) => {
    const testId = getTestId(test)
    if (!testId) return
    setPublishing(true)
    try {
      await scheduleTestPublication(testId, payload)
      showToast('تمت جدولة نشر الامتحان')
      navigate(ROUTES.EXAMS)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  if (isNew) {
    return (
      <div className="space-y-6">
        <WizardHeader onBack={() => navigate(ROUTES.EXAMS)} title="إنشاء امتحان جديد" />
        <ExamWizardStepper currentStep={TEST_WIZARD_STEPS.INFO} />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <ExamBasicInfoStep
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
            onDraftChange={setDraft}
            submitting={submitting}
            savingDraft={savingDraft}
          />
          <ExamSummarySidebar test={null} draft={draft} currentStep={TEST_WIZARD_STEPS.INFO} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[#94A3B8]">جاري تحميل الامتحان...</p>
      </div>
    )
  }

  if (!test) {
    return <Navigate to={ROUTES.EXAMS} replace />
  }

  const initialInfo = {
    name: getTestName(test),
    description: test.description || '',
    subject_id: test.subject_id,
    duration_minutes: test.duration_minutes ?? 60,
    total_score: test.total_score ?? 100,
    passing_score: test.passing_score ?? 60,
    auto_distribute_scores: test.auto_distribute_scores ?? true,
  }

  return (
    <div className="space-y-6">
      {!blueprintActive ? (
        <>
          <WizardHeader onBack={() => navigate(ROUTES.EXAMS)} title={getTestName(test) || 'تحرير الامتحان'} />
          <ExamWizardStepper currentStep={currentStep} />
        </>
      ) : null}

      <div className={`grid gap-6 ${blueprintActive ? '' : 'lg:grid-cols-[1fr_300px]'}`}>
        <div>
          {currentStep === TEST_WIZARD_STEPS.INFO ? (
            <ExamBasicInfoStep
              initialValues={initialInfo}
              onSubmit={handleUpdateInfo}
              onSaveDraft={handleSaveDraft}
              submitting={submitting}
              savingDraft={savingDraft}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.QUESTIONS ? (
            <ExamAddQuestionsStep
              test={test}
              onRefresh={() => loadTest(true)}
              onNext={async () => {
                await loadTest(true)
                goToStep(TEST_WIZARD_STEPS.SETTINGS)
              }}
              onBack={() => goToStep(TEST_WIZARD_STEPS.INFO)}
              onBlueprintActiveChange={setBlueprintActive}
              onSaveDraftProgress={handleSaveQuestionsDraftProgress}
              savingDraft={savingDraft}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.SETTINGS ? (
            <ExamSettingsStep
              test={test}
              onSubmit={handleUpdateSettings}
              submitting={submitting}
              savingDraft={savingDraft}
              onBack={() => goToStep(TEST_WIZARD_STEPS.QUESTIONS)}
              onSaveDraft={handleSaveSettingsDraft}
              onFormChange={setSettingsPreview}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.REVIEW ? (
            <ExamReviewStep
              test={test}
              onNext={() => goToStep(TEST_WIZARD_STEPS.PUBLISH)}
              onBack={() => goToStep(TEST_WIZARD_STEPS.SETTINGS)}
              savingDraft={savingDraft}
              onSaveDraft={() => handleSaveWizardDraftProgress(TEST_WIZARD_STEPS.REVIEW)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishStep
              test={test}
              publishing={publishing}
              savingDraft={savingDraft}
              onPublishNow={handlePublishNow}
              onSchedule={handleSchedule}
              onBack={() => goToStep(TEST_WIZARD_STEPS.REVIEW)}
              onSaveDraft={() => handleSaveWizardDraftProgress(TEST_WIZARD_STEPS.PUBLISH)}
            />
          ) : null}
        </div>

        {!blueprintActive ? (
          currentStep === TEST_WIZARD_STEPS.SETTINGS ? (
            <ExamSettingsSummarySidebar
              test={test}
              settings={settingsPreview || test?.settings_config}
            />
          ) : currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishSummarySidebar
              test={test}
              settings={settingsPreview || test?.settings_config}
            />
          ) : (
            <ExamSummarySidebar test={test} currentStep={currentStep} />
          )
        ) : null}
      </div>
    </div>
  )
}

function WizardHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-[#E5E9EB] text-[#64748B]"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      <div>
        <p className="text-sm font-bold text-[#2AA8A2]">معالج إنشاء الامتحان</p>
        <h1 className="text-2xl font-extrabold text-[#2A3433]">{title}</h1>
      </div>
    </div>
  )
}

export function ExamCreatePage() {
  return <ExamWizardPage isNew />
}

export default ExamWizardPage
