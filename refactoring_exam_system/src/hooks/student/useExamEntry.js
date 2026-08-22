import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import {
  applyAuthoritativeMaxAttempts,
  normalizeStudentTestEntry,
} from '../../lib/studentExamEntry'
import { getStudentTestEntry } from '../../services/studentDashboard.service'
import { getAvailableTests } from '../../services/tests.service'
import { useAuthStore } from '../../store/authStore'

function readMaxAttemptsFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null

  const settingsConfig = payload.settings_config || payload.settings || {}
  const attemptSettings = settingsConfig.attempt_settings || payload.attempt_settings || {}
  const rules = payload.rules || {}

  const candidates = [
    attemptSettings.max_attempts,
    settingsConfig.max_attempts,
    payload.max_attempts,
    payload.maxAttempts,
    rules.max_attempts,
    rules.maxAttempts,
  ]

  for (const value of candidates) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 1) return Math.floor(parsed)
  }
  return null
}

/**
 * Students cannot call GET /tests/{id} (403).
 * Do not call /student/exams here (CORS failures on this host).
 * Prefer entry payload, then optional /tests/available only.
 */
async function resolveAuthoritativeMaxAttempts(testId, entryPayload) {
  const fromEntry = readMaxAttemptsFromPayload(entryPayload)
  if (fromEntry != null && fromEntry > 1) return fromEntry

  try {
    const available = await getAvailableTests()
    const list = available?.tests || available?.items || available?.data || available?.results || []
    const match = list.find(
      (item) => String(item?.test_id ?? item?.id ?? item?.exam_id) === String(testId),
    )
    const fromAvailable = readMaxAttemptsFromPayload(match)
    if (fromAvailable != null) return fromAvailable
  } catch {
    // ignore — entry payload remains the source of truth
  }

  return fromEntry
}

async function loadNormalizedEntry(testId, authUserName) {
  const data = await getStudentTestEntry(testId)
  let normalized = normalizeStudentTestEntry(data)
  if (!normalized.studentName && authUserName) {
    normalized.studentName = authUserName
  }

  const authoritativeMax = await resolveAuthoritativeMaxAttempts(testId, data)
  if (authoritativeMax != null) {
    normalized = applyAuthoritativeMaxAttempts(normalized, authoritativeMax)
  }

  return normalized
}

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
      const normalized = await loadNormalizedEntry(testId, authUserName)
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
        const normalized = await loadNormalizedEntry(testId, authUserName)
        if (cancelled) return
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
