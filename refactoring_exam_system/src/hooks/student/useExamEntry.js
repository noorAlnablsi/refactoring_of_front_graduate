import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { normalizeStudentTestEntry } from '../../lib/studentExamEntry'
import { getStudentTestEntry } from '../../services/studentDashboard.service'
import { useAuthStore } from '../../store/authStore'

export function useExamEntry(testId) {
  const { t } = useTranslation('student')
  const authUserName = useAuthStore((state) => state.user?.full_name || state.user?.name || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entry, setEntry] = useState(null)

  const fetchEntry = useCallback(async () => {
    if (!testId) {
      setError(t('entry.invalidTest'))
      setEntry(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    setError('')

    try {
      const data = await getStudentTestEntry(testId)
      const normalized = normalizeStudentTestEntry(data)
      if (!normalized.studentName && authUserName) {
        normalized.studentName = authUserName
      }
      setEntry(normalized)
      return normalized
    } catch (err) {
      setEntry(null)
      setError(translateBackendMessage(err.message) || t('entry.loadError'))
      return null
    } finally {
      setLoading(false)
    }
  }, [testId, t, authUserName])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!testId) {
        setError(t('entry.invalidTest'))
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const data = await getStudentTestEntry(testId)
        if (cancelled) return
        const normalized = normalizeStudentTestEntry(data)
        if (!normalized.studentName && authUserName) {
          normalized.studentName = authUserName
        }
        setEntry(normalized)
      } catch (err) {
        if (cancelled) return
        setEntry(null)
        setError(translateBackendMessage(err.message) || t('entry.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [testId, t, authUserName])

  return {
    loading,
    error,
    entry,
    refetch: fetchEntry,
  }
}

export default useExamEntry
