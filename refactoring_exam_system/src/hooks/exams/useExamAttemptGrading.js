import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import {
  GRADING_WIZARD_STEPS,
  getAutoGradedAnswers,
  getPendingManualAnswers,
  hasPendingManualGrading,
} from '../../lib/grading/attemptGradingModel'
import {
  getProctoringGradingReview,
  getTestAttempt,
  patchAttemptFinalScore,
  submitManualGrading,
} from '../../services/tests.service'
import { showAppToast } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'

export function useExamAttemptGrading(testId, attemptId) {
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [attempt, setAttempt] = useState(null)
  const [step, setStep] = useState(GRADING_WIZARD_STEPS.AUTO)
  const [manualScores, setManualScores] = useState({})
  const [manualFeedback, setManualFeedback] = useState({})
  const [review, setReview] = useState(null)
  const [reviewError, setReviewError] = useState(null)
  const [finalScoreInput, setFinalScoreInput] = useState('')
  const [finalReason, setFinalReason] = useState('')
  const [approveSuggested, setApproveSuggested] = useState(true)

  const reload = useCallback(async () => {
    if (!testId || !attemptId) return
    setLoading(true)
    try {
      const data = await getTestAttempt(testId, attemptId)
      const next = data.attempt || data
      setAttempt(next)

      const pending = getPendingManualAnswers(next)
      const scores = {}
      const feedback = {}
      pending.forEach((q) => {
        const id = q.test_question_id
        scores[id] = q.answer?.earned_score ?? ''
        feedback[id] = q.answer?.teacher_feedback || ''
      })
      setManualScores(scores)
      setManualFeedback(feedback)

      if (hasPendingManualGrading(next)) {
        setStep(GRADING_WIZARD_STEPS.MANUAL)
      } else if (String(next.status || '').toUpperCase() === 'GRADED') {
        setStep(GRADING_WIZARD_STEPS.FINAL)
      } else {
        setStep(GRADING_WIZARD_STEPS.AUTO)
      }
    } catch (err) {
      showToast(err?.message || String(err), 'error')
      navigate(ROUTES.EXAM_ATTEMPTS.replace(':id', testId), { replace: true })
    } finally {
      setLoading(false)
    }
  }, [testId, attemptId, navigate, showToast])

  useEffect(() => {
    reload()
  }, [reload])

  const autoQuestions = useMemo(() => getAutoGradedAnswers(attempt), [attempt])
  const pendingQuestions = useMemo(() => getPendingManualAnswers(attempt), [attempt])

  const loadReview = useCallback(async () => {
    if (!testId || !attemptId) return null
    setReviewError(null)
    try {
      const data = await getProctoringGradingReview(testId, attemptId)
      setReview(data)
      setFinalScoreInput(
        data.suggested_final_score != null ? String(data.suggested_final_score) : '',
      )
      setApproveSuggested(true)
      return data
    } catch (err) {
      setReview(null)
      setReviewError(err?.message || String(err))

      return null
    }
  }, [testId, attemptId])

  const goNextFromAuto = useCallback(() => {
    if (pendingQuestions.length > 0) {
      setStep(GRADING_WIZARD_STEPS.MANUAL)
      return
    }
    setStep(GRADING_WIZARD_STEPS.PROCTORING)
    void loadReview()
  }, [pendingQuestions.length, loadReview])

  const saveManual = useCallback(async () => {
    if (!testId || !attemptId) return
    const answers = pendingQuestions.map((q) => {
      const id = q.test_question_id
      return {
        test_question_id: id,
        earned_score: Number(manualScores[id]),
        teacher_feedback: String(manualFeedback[id] || '').trim() || undefined,
      }
    })

    for (const row of answers) {
      if (!Number.isFinite(row.earned_score) || row.earned_score < 0) {
        showAppToast('grading.manual.invalidScore', 'error', { ns: 'exams' })
        return
      }
    }

    setSaving(true)
    try {
      const data = await submitManualGrading(testId, attemptId, answers)
      const next = data.attempt || data
      setAttempt(next)
      showAppToast('grading.manual.saved', 'success', { ns: 'exams' })
      setStep(GRADING_WIZARD_STEPS.PROCTORING)
      await loadReview()
    } catch (err) {
      showToast(err?.message || String(err), 'error')
    } finally {
      setSaving(false)
    }
  }, [
    testId,
    attemptId,
    pendingQuestions,
    manualScores,
    manualFeedback,
    loadReview,
    showToast,
  ])

  const goNextFromProctoring = useCallback(() => {
    setStep(GRADING_WIZARD_STEPS.FINAL)
  }, [])

  const submitFinal = useCallback(async () => {
    if (!testId || !attemptId) return
    setSaving(true)
    try {
      const payload = approveSuggested
        ? { approved: true }
        : {
            approved: false,
            final_score: Number(finalScoreInput),
            reason: finalReason.trim() || undefined,
          }

      if (!approveSuggested && !Number.isFinite(payload.final_score)) {
        showAppToast('grading.final.invalidScore', 'error', { ns: 'exams' })
        setSaving(false)
        return
      }

      const data = await patchAttemptFinalScore(testId, attemptId, payload)
      showAppToast('grading.final.saved', 'success', { ns: 'exams' })
      if (data?.attempt) setAttempt(data.attempt)
      else if (data?.status) {
        setAttempt((prev) => ({ ...(prev || {}), status: data.status, final_score: data.final_score }))
      }
      navigate(ROUTES.EXAM_ATTEMPTS.replace(':id', testId))
    } catch (err) {
      showToast(err?.message || String(err), 'error')
    } finally {
      setSaving(false)
    }
  }, [
    testId,
    attemptId,
    approveSuggested,
    finalScoreInput,
    finalReason,
    navigate,
    showToast,
  ])

  return {
    loading,
    saving,
    attempt,
    step,
    setStep,
    autoQuestions,
    pendingQuestions,
    manualScores,
    setManualScores,
    manualFeedback,
    setManualFeedback,
    review,
    reviewError,
    finalScoreInput,
    setFinalScoreInput,
    finalReason,
    setFinalReason,
    approveSuggested,
    setApproveSuggested,
    goNextFromAuto,
    saveManual,
    goNextFromProctoring,
    submitFinal,
    loadReview,
    reload,
  }
}

export default useExamAttemptGrading
