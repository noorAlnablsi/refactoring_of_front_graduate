import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { TEST_STATUS, TEST_WIZARD_STEPS } from '../../constants/tests'
import { saveExamWizardProgress } from '../../lib/examWizardProgress'
import { canEditTest, getEditBlockedMessage } from '../../lib/testDisplay'
import { getTestId, getTestName, mergeTestPreservingQuestions } from '../../lib/testModel'
import { buildUpdateTestInfoPayloadFromStep1 } from '../../lib/testPayload'
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

async function persistNewTest({ create }) {
  const data = await createTest(create)
  return data.test || data
}

export function useExamWizard({ isNew = false } = {}) {
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
      if (currentStep === TEST_WIZARD_STEPS.SETTINGS && step !== TEST_WIZARD_STEPS.SETTINGS) {
        setSettingsPreview(null)
      }
      setSearchParams({ step: String(step) }, { replace: true })
      const testId = getTestId(test)
      if (testId && step !== TEST_WIZARD_STEPS.QUESTIONS) {
        saveExamWizardProgress(testId, { step, questions: null })
      }
    },
    [setSearchParams, test, currentStep],
  )

  const exitToExams = useCallback(() => {
    navigate(ROUTES.EXAMS)
  }, [navigate])

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

  const loadTest = useCallback(
    async (silent = false) => {
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
    },
    [id, navigate, showToast],
  )

  useEffect(() => {
    if (!isNew && id) {
      loadTest()
    }
  }, [isNew, id, loadTest])

  const handleCreate = useCallback(
    async (payload) => {
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
    },
    [navigate, showToast],
  )

  const handleSaveDraft = useCallback(
    async (payload) => {
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
    },
    [currentStep, isNew, navigate, showToast, test],
  )

  const handleUpdateInfo = useCallback(
    async (payload) => {
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
    },
    [goToStep, showToast, test],
  )

  const handleUpdateSettings = useCallback(
    async (payload) => {
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
    },
    [goToStep, showToast, test],
  )

  const handlePublishNow = useCallback(async () => {
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
  }, [navigate, showToast, test])

  const handleSchedule = useCallback(
    async (payload) => {
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
    },
    [navigate, showToast, test],
  )

  const handleQuestionsNext = useCallback(async () => {
    await loadTest(true)
    goToStep(TEST_WIZARD_STEPS.SETTINGS)
  }, [goToStep, loadTest])

  const initialInfo = useMemo(() => {
    if (!test) return null
    return {
      name: getTestName(test),
      description: test.description || '',
      subject_id: test.subject_id,
      duration_minutes: test.duration_minutes ?? 60,
      total_score: test.total_score ?? 100,
      passing_score: test.passing_score ?? 60,
      auto_distribute_scores: test.auto_distribute_scores ?? true,
    }
  }, [test])

  const settingsSidebarConfig = useMemo(() => {
    if (currentStep === TEST_WIZARD_STEPS.SETTINGS) {
      return settingsPreview || test?.settings_config
    }
    if (currentStep === TEST_WIZARD_STEPS.PUBLISH) {
      return test?.settings_config
    }
    return null
  }, [currentStep, settingsPreview, test?.settings_config])

  return {
    currentStep,
    test,
    loading,
    submitting,
    publishing,
    draft,
    setDraft,
    savingDraft,
    blueprintActive,
    setBlueprintActive,
    settingsPreview,
    setSettingsPreview,
    initialInfo,
    settingsSidebarConfig,
    goToStep,
    exitToExams,
    loadTest,
    handleCreate,
    handleSaveDraft,
    handleUpdateInfo,
    handleUpdateSettings,
    handlePublishNow,
    handleSchedule,
    handleQuestionsNext,
    handleSaveWizardDraftProgress,
    handleSaveSettingsDraft,
    handleSaveQuestionsDraftProgress,
  }
}
