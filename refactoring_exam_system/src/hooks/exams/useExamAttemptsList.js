import { useCallback, useEffect, useState } from 'react'
import { normalizeAttemptListItem } from '../../lib/grading/attemptGradingModel'
import { listTestAttempts } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

export function useExamAttemptsList(testId) {
  const showToast = useToastStore((s) => s.showToast)
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      const data = await listTestAttempts(testId)
      const list = (data.attempts || []).map(normalizeAttemptListItem).filter(Boolean)
      setAttempts(list)
      setCount(Number(data.count) || list.length)
    } catch (err) {
      setError(err?.message || String(err))
      showToast(err?.message || String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [testId, showToast])

  useEffect(() => {
    reload()
  }, [reload])

  return { loading, attempts, count, error, reload }
}

export default useExamAttemptsList
