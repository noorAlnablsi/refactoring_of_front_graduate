import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { getSubjectsWithStats } from '../../services/subjects.service'

export function useSubjects() {
  const { t } = useTranslation('subjects')
  const [subjects, setSubjects] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSubjectsWithStats()
      setSubjects(data.subjects || [])
      setCount(data.count ?? data.subjects?.length ?? 0)
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    let cancelled = false

    getSubjectsWithStats()
      .then((data) => {
        if (cancelled) return
        setSubjects(data.subjects || [])
        setCount(data.count ?? data.subjects?.length ?? 0)
      })
      .catch((err) => {
        if (cancelled) return
        setError(translateBackendMessage(err.message) || t('errors.loadFailed'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  return { subjects, count, loading, error, refetch: fetchSubjects }
}
