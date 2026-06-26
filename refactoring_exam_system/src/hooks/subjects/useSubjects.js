import { useCallback, useEffect, useState } from 'react'
import { getSubjectsWithStats } from '../../services/subjects.service'

export function useSubjects() {
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
        setError(err.message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { subjects, count, loading, error, refetch: fetchSubjects }
}
