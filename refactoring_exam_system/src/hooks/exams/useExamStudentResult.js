import { useCallback, useEffect, useState } from 'react'
import { normalizeExamReviewQuestions } from '../../lib/testModel'
import { getAttemptGradingResult, getTestAttempt } from '../../services/tests.service'

function normalizeReviewPayload(data) {
  const attempt = data?.attempt || data
  const questions = normalizeExamReviewQuestions(
    Array.isArray(attempt?.questions)
      ? attempt.questions
      : Array.isArray(data?.questions)
        ? data.questions
        : [],
  )
  return { attempt, questions }
}

export function useExamStudentResult(testId, attemptId, enabled = true) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])

  const load = useCallback(async () => {
    if (!enabled || !testId || !attemptId) return
    setLoading(true)
    setError('')
    try {
      let payload = null
      try {
        payload = await getAttemptGradingResult(testId, attemptId)
      } catch {
        payload = await getTestAttempt(testId, attemptId)
      }
      const next = normalizeReviewPayload(payload)
      setAttempt(next.attempt)
      setQuestions(next.questions)
    } catch (err) {
      setError(err?.message || String(err))
      setAttempt(null)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [attemptId, enabled, testId])

  useEffect(() => {
    void load()
  }, [load])

  return { loading, error, attempt, questions, reload: load }
}

export default useExamStudentResult
