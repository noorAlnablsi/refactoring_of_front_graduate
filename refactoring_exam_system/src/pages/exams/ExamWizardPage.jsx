import { useCallback, useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExamSummarySidebar from '../../components/exams/ExamSummarySidebar'
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
import { getTestId, getTestName } from '../../lib/testModel'
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

  const goToStep = useCallback(
    (step) => {
      setSearchParams({ step: String(step) }, { replace: true })
    },
    [setSearchParams],
  )

  const loadTest = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getTestById(id)
      const testData = data.test || data
      setTest(testData)

      if (!canEditTest(testData) && testData.status === TEST_STATUS.DRAFT) {
        const msg = getEditBlockedMessage(testData)
        if (msg) showToast(msg, 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
      navigate(ROUTES.EXAMS, { replace: true })
    } finally {
      setLoading(false)
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

  const persistNewTest = async ({ create, scoring_config }) => {
    const data = await createTest(create)
    const created = data.test || data
    const testId = getTestId(created)
    if (scoring_config) {
      const updated = await updateTest(testId, { scoring_config })
      return updated.test || updated
    }
    return created
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
        showToast('تم حفظ المسودة')
        navigate(ROUTES.EXAM_EDIT.replace(':id', getTestId(created)), { replace: true })
        return
      }
      const testId = getTestId(test)
      if (!testId) return
      const data = await updateTest(testId, {
        ...payload.create,
        scoring_config: payload.scoring_config,
      })
      setTest(data.test || data)
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
      const data = await updateTest(testId, {
        ...payload.create,
        scoring_config: payload.scoring_config,
      })
      setTest(data.test || data)
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
      setTest(data.test || data)
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
      <WizardHeader onBack={() => navigate(ROUTES.EXAMS)} title={getTestName(test) || 'تحرير الامتحان'} />
      <ExamWizardStepper currentStep={currentStep} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
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
              onRefresh={loadTest}
              onNext={() => goToStep(TEST_WIZARD_STEPS.SETTINGS)}
              onBack={() => goToStep(TEST_WIZARD_STEPS.INFO)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.SETTINGS ? (
            <ExamSettingsStep
              test={test}
              onSubmit={handleUpdateSettings}
              submitting={submitting}
              onBack={() => goToStep(TEST_WIZARD_STEPS.QUESTIONS)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.REVIEW ? (
            <ExamReviewStep
              test={test}
              onNext={() => goToStep(TEST_WIZARD_STEPS.PUBLISH)}
              onBack={() => goToStep(TEST_WIZARD_STEPS.SETTINGS)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishStep
              test={test}
              publishing={publishing}
              onPublishNow={handlePublishNow}
              onSchedule={handleSchedule}
              onBack={() => goToStep(TEST_WIZARD_STEPS.REVIEW)}
            />
          ) : null}
        </div>

        <ExamSummarySidebar test={test} currentStep={currentStep} />
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
