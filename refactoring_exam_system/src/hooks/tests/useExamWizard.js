import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { TEST_KIND, TEST_STATUS, TEST_WIZARD_STEPS } from '../../constants/tests'
import { parseApiError } from '../../lib/apiError'
import { saveExamWizardProgress } from '../../lib/examWizardProgress'
import { scrollDashboardMainToTop } from '../../lib/shellUi'
import { canEditTest, getEditBlockedMessage } from '../../lib/testDisplay'
import { getTestId, getTestName, mergeTestPreservingQuestions } from '../../lib/testModel'
import {
  buildUpdateSurveyInfoPayloadFromStep1,
  buildUpdateTestInfoPayloadFromStep1,
} from '../../lib/testPayload'
import { isSurveyTest, getSurveyAudienceScope, getSurveyWizardEditPath } from '../../lib/surveys'
import { normalizeSettingsConfig } from '../../lib/testSettings'
import {
  createTest,
  getTestById,
  publishTestNow,
  scheduleTestPublication,
  updateTest,
} from '../../services/tests.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

function parseStep(value) {
  const step = Number(value)
  if (step >= 1 && step <= 5) return step
  return TEST_WIZARD_STEPS.INFO
}

async function persistNewTest(payload) {
  const body = { ...(payload?.create || payload || {}) }
  delete body.scoring_config
  const data = await createTest(body)
  return data.test || data
}

export function useExamWizard({ isNew = false, kind = TEST_KIND.EXAM } = {}) {
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

  const isSurvey = isNew ? kind === TEST_KIND.SURVEY : isSurveyTest(test) || kind === TEST_KIND.SURVEY
  const toastNs = isSurvey ? 'surveys' : 'exams'
  const listRoute = isSurvey ? ROUTES.SURVEYS : ROUTES.EXAMS
  const editPathFor = useCallback(
    (testId) => (isSurvey ? getSurveyWizardEditPath(testId) : ROUTES.EXAM_EDIT.replace(':id', testId)),
    [isSurvey],
  )

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
      requestAnimationFrame(() => {
        scrollDashboardMainToTop()
        requestAnimationFrame(scrollDashboardMainToTop)
      })
    },
    [setSearchParams, test, currentStep],
  )

  const exitToList = useCallback(() => {
    navigate(listRoute)
  }, [navigate, listRoute])

  const handleSaveWizardDraftProgress = useCallback(
    async (step, extra = {}) => {
      const testId = getTestId(test)
      if (!testId) return

      setSavingDraft(true)
      try {
        saveExamWizardProgress(testId, { step, questions: null, ...extra })
        showAppToast('toast.draftSaved', 'success', { ns: toastNs })
        navigate(listRoute)
      } finally {
        setSavingDraft(false)
      }
    },
    [navigate, showToast, test, listRoute, toastNs],
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
        showAppToast('toast.draftSaved', 'success', { ns: toastNs })
        navigate(listRoute)
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setSavingDraft(false)
      }
    },
    [navigate, showToast, test, listRoute, toastNs],
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
        showAppToast('toast.draftSaved', 'success', { ns: toastNs })
        navigate(listRoute)
      } finally {
        setSavingDraft(false)
      }
    },
    [currentStep, navigate, showToast, test, listRoute, toastNs],
  )

  const loadTest = useCallback(
    async (silent = false) => {
      if (!id) return null
      if (!silent) setLoading(true)
      try {
        const data = await getTestById(id)
        const fetched = data.test || data
        let merged = fetched
        setTest((prev) => {
          merged = mergeTestPreservingQuestions(prev, fetched)
          return merged
        })

        if (!canEditTest(merged)) {
          const msg = getEditBlockedMessage(merged)
          if (msg) showToast(msg, 'error')
        }
        return merged
      } catch (err) {
        showToast(parseApiError(err), 'error')
        navigate(listRoute, { replace: true })
        return null
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [id, navigate, showToast, listRoute],
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
        showAppToast('toast.created', 'success', { ns: toastNs })
        navigate(editPathFor(getTestId(created)) + '?step=2', { replace: true })
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setSubmitting(false)
      }
    },
    [editPathFor, navigate, showToast, toastNs],
  )

  const handleSaveDraft = useCallback(
    async (payload) => {
      setSavingDraft(true)
      try {
        if (isNew) {
          const created = await persistNewTest(payload)
          saveExamWizardProgress(getTestId(created), { step: TEST_WIZARD_STEPS.INFO })
          showAppToast('toast.draftSaved', 'success', { ns: toastNs })
          navigate(editPathFor(getTestId(created)), { replace: true })
          return
        }
        const testId = getTestId(test)
        if (!testId) return
        const data = await updateTest(
          testId,
          isSurvey
            ? buildUpdateSurveyInfoPayloadFromStep1(payload)
            : buildUpdateTestInfoPayloadFromStep1(payload, {
                autoDistribute: Boolean(test?.auto_distribute_scores),
              }),
        )
        setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
        saveExamWizardProgress(testId, { step: currentStep })
        showAppToast('toast.draftSaved', 'success', { ns: toastNs })
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setSavingDraft(false)
      }
    },
    [currentStep, editPathFor, isNew, isSurvey, navigate, showToast, test, toastNs],
  )

  const handleUpdateInfo = useCallback(
    async (payload) => {
      const testId = getTestId(test)
      if (!testId) return
      setSubmitting(true)
      try {
        const data = await updateTest(
          testId,
          isSurvey
            ? buildUpdateSurveyInfoPayloadFromStep1(payload)
            : buildUpdateTestInfoPayloadFromStep1(payload, {
                autoDistribute: Boolean(test?.auto_distribute_scores),
              }),
        )
        setTest((prev) => mergeTestPreservingQuestions(prev, data.test || data))
        showAppToast('toast.infoSaved', 'success', { ns: toastNs })
        goToStep(TEST_WIZARD_STEPS.QUESTIONS)
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setSubmitting(false)
      }
    },
    [goToStep, isSurvey, showToast, test, toastNs],
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
        showAppToast('toast.settingsSaved', 'success', { ns: toastNs })
        goToStep(TEST_WIZARD_STEPS.REVIEW)
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setSubmitting(false)
      }
    },
    [goToStep, showToast, test, toastNs],
  )

  const handlePublishNow = useCallback(async () => {
    const testId = getTestId(test)
    if (!testId) return
    setPublishing(true)
    try {
      await publishTestNow(testId)
      showAppToast('toast.published', 'success', { ns: toastNs })
      navigate(listRoute)
    } catch (err) {
      showToast(parseApiError(err), 'error')
    } finally {
      setPublishing(false)
    }
  }, [listRoute, navigate, showToast, test, toastNs])

  const handleSchedule = useCallback(
    async (payload) => {
      const testId = getTestId(test)
      if (!testId) return
      setPublishing(true)
      try {
        await scheduleTestPublication(testId, payload)
        showAppToast('toast.scheduled', 'success', { ns: toastNs })
        navigate(listRoute)
      } catch (err) {
        showToast(parseApiError(err), 'error')
      } finally {
        setPublishing(false)
      }
    },
    [listRoute, navigate, showToast, test, toastNs],
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
      auto_distribute_scores: Boolean(test.auto_distribute_scores),
      audience_scope: getSurveyAudienceScope(test),
    }
  }, [test])

  const settingsSidebarConfig = useMemo(() => {
    if (currentStep === TEST_WIZARD_STEPS.SETTINGS) {
      return settingsPreview
        ? normalizeSettingsConfig(settingsPreview)
        : normalizeSettingsConfig(test?.settings_config || {})
    }
    if (currentStep === TEST_WIZARD_STEPS.PUBLISH) {
      return normalizeSettingsConfig(test?.settings_config || {})
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
    exitToExams: exitToList,
    isSurvey,
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
