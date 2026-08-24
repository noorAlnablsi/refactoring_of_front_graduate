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
  getAttemptGradingResult,
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

  const normalizeAttemptPayload = useCallback((payload) => {
    const attempt = payload?.attempt || payload
    const fallbackQuestions = Array.isArray(payload?.questions) ? payload.questions : []
    const attemptQuestions = Array.isArray(attempt?.questions) ? attempt.questions : []
    return {
      ...(attempt || {}),
      questions: attemptQuestions.length ? attemptQuestions : fallbackQuestions,
      answers: Array.isArray(attempt?.answers)
        ? attempt.answers
        : Array.isArray(payload?.answers)
          ? payload.answers
          : [],
    }
  }, [])

  const reload = useCallback(async () => {
    if (!testId || !attemptId) return
    setLoading(true)
    try {
      // وفقًا لردّ الباك: endpoint grading/result لا يرجع إجابات الأسئلة.
      // للحصول على questions[].answer لازم نستخدم details endpoint:
      // GET /tests/{testId}/attempts/{attemptId}
      const data = await getTestAttempt(testId, attemptId)
      const next = normalizeAttemptPayload(data)
      setAttempt(next)

      // grading/result يستخدم فقط لتحديد أين نحن ضمن الفلو (MANUAL vs PROCTORING vs FINAL)
      // لأنه لا يحتوي إجابات الأسئلة نفسها.
      let gradingStatus = null
      try {
        gradingStatus = await getAttemptGradingResult(testId, attemptId)
      } catch {
        gradingStatus = null
      }
      const msg = String(gradingStatus?.message || '').toUpperCase()
      const gradingCompleted = Boolean(gradingStatus?.grading_completed)

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

      if (String(next.status || '').toUpperCase() === 'GRADED' || gradingCompleted) {
        setStep(GRADING_WIZARD_STEPS.FINAL)
      } else if (/MANUAL\s+GRADING|WAITING\s+FOR\s+MANUAL|MANUAL/i.test(msg) || hasPendingManualGrading(next)) {
        setStep(GRADING_WIZARD_STEPS.MANUAL)
      } else if (/PROCTORING/i.test(msg)) {
        setStep(GRADING_WIZARD_STEPS.PROCTORING)
      } else {
        setStep(GRADING_WIZARD_STEPS.AUTO)
      }
    } catch (err) {
      showToast(err?.message || String(err), 'error')
      navigate(ROUTES.EXAM_ATTEMPTS.replace(':id', testId), { replace: true })
    } finally {
      setLoading(false)
    }
  }, [testId, attemptId, navigate, normalizeAttemptPayload, showToast])

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

  useEffect(() => {
    if (step !== GRADING_WIZARD_STEPS.PROCTORING && step !== GRADING_WIZARD_STEPS.FINAL) return undefined
    void loadReview()
    return undefined
  }, [step, loadReview])

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
      await submitManualGrading(testId, attemptId, answers)

      // Refresh لضمان أن الباك أعاد questions[].answer للواجهة
      const refreshed = await getTestAttempt(testId, attemptId)
      const next = normalizeAttemptPayload(refreshed)
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
    normalizeAttemptPayload,
    showToast,
  ])

  const goNextFromProctoring = useCallback(() => {
    setStep(GRADING_WIZARD_STEPS.FINAL)
    void loadReview()
  }, [loadReview])

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

      await patchAttemptFinalScore(testId, attemptId, payload)

      // Refresh لعرض الحالة النهائية/الدرجات حسب آخر بيانات من الباك
      const refreshed = await getTestAttempt(testId, attemptId)
      const next = normalizeAttemptPayload(refreshed)
      setAttempt(next)
      showAppToast('grading.final.saved', 'success', { ns: 'exams' })
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
