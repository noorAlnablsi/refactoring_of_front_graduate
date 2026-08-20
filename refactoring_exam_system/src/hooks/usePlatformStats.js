import { useEffect, useState } from 'react'
import { getPlatformStats } from '../services/publicStats.service'

let cachedStats = null
let inflight = null

async function loadPlatformStats() {
  if (cachedStats) return cachedStats
  if (!inflight) {
    inflight = getPlatformStats()
      .then((stats) => {
        cachedStats = stats
        return stats
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}


export function usePlatformStats() {
  const [stats, setStats] = useState(cachedStats)
  const [loading, setLoading] = useState(!cachedStats)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(!cachedStats)
      try {
        const next = await loadPlatformStats()
        if (!cancelled) {
          setStats(next)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'failed')
          if (!cachedStats) setStats(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    usersCount: stats?.usersCount ?? null,
    studentsCount: stats?.studentsCount ?? null,
    loading,
    error,
  }
}

export default usePlatformStats
