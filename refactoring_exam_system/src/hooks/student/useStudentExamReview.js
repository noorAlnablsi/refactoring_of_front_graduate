import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAttemptGradingResult, getTestAttempt } from '../../services/tests.service'

function normalizeReviewQuestions(data) {
  const attempt = data?.attempt || data
  if (Array.isArray(attempt?.questions) && attempt.questions.length) {
    return attempt.questions
  }
  if (Array.isArray(data?.questions) && data.questions.length) {
    return data.questions
  }
  return []
}

export function useStudentExamReview(testId, attemptId) {
  const { t } = useTranslation('student')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])

  const load = useCallback(async () => {
    if (!testId || !attemptId) return
    setLoading(true)
    setError('')
    try {
      let payload = null
      try {
        payload = await getAttemptGradingResult(testId, attemptId)
      } catch {
        payload = await getTestAttempt(testId, attemptId)
      }
      const nextAttempt = payload?.attempt || payload
      setAttempt(nextAttempt)
      setQuestions(normalizeReviewQuestions(payload))
    } catch (err) {
      setError(err.message || t('performance.review.loadError'))
      setAttempt(null)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [testId, attemptId, t])

  useEffect(() => {
    void load()
  }, [load])

  return {
    loading,
    error,
    attempt,
    questions,
    reload: load,
  }
}

export default useStudentExamReview
