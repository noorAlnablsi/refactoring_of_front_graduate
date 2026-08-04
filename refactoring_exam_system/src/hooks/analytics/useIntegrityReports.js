import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  INTEGRITY_REPORT_STATUS,
  normalizeIntegrityReport,
  normalizeIntegrityReportsList,
} from '../../lib/integrityReportsModel'
import { canAccessIntegrityReports } from '../../lib/workspaceContext'
import {
  getIntegrityReport,
  getIntegrityReports,
  reviewIntegrityReport,
} from '../../services/proctoring/integrityReports.service'
import { getSubjects } from '../../services/subjects.service'

export function useIntegrityReportsList({
  page = 1,
  perPage = 20,
  status = '',
  subjectId = '',
  search = '',
  dateFrom = '',
  dateTo = '',
} = {}) {
  const { t } = useTranslation('analytics')
  const canAccess = canAccessIntegrityReports()
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(canAccess)
  const [error, setError] = useState('')
  const [subjects, setSubjects] = useState([])

  const params = useMemo(() => {
    const next = { page, per_page: perPage }
    if (status) next.status = status
    if (subjectId) next.subject_id = Number(subjectId)
    if (search.trim()) next.search = search.trim()
    if (dateFrom) next.date_from = dateFrom
    if (dateTo) next.date_to = dateTo
    return next
  }, [page, perPage, status, subjectId, search, dateFrom, dateTo])

  const refetch = useCallback(async () => {
    if (!canAccessIntegrityReports()) {
      setReports([])
      setTotal(0)
      setPages(1)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await getIntegrityReports(params)
      const normalized = normalizeIntegrityReportsList(payload)
      setReports(normalized.reports)
      setTotal(normalized.total)
      setPages(normalized.pages)
    } catch (err) {
      setReports([])
      setTotal(0)
      setPages(1)
      setError(err.message || t('errors.loadIntegrityFailed'))
    } finally {
      setLoading(false)
    }
  }, [params, t])

  useEffect(() => {
    if (!canAccess) return undefined
    getSubjects()
      .then((data) => setSubjects(data.subjects || []))
      .catch(() => setSubjects([]))
    return undefined
  }, [canAccess])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    canAccess,
    reports,
    total,
    pages,
    loading,
    error,
    subjects,
    refetch,
    statuses: INTEGRITY_REPORT_STATUS,
  }
}

export function useIntegrityReportDetail(reportId) {
  const { t } = useTranslation('analytics')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(Boolean(reportId))
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!reportId) {
      setReport(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await getIntegrityReport(reportId)
      setReport(normalizeIntegrityReport(payload.report || payload))
    } catch (err) {
      setReport(null)
      setError(err.message || t('errors.loadIntegrityFailed'))
    } finally {
      setLoading(false)
    }
  }, [reportId, t])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { report, loading, error, refetch }
}

export function useIntegrityReportReview() {
  const { t } = useTranslation('analytics')
  const [submitting, setSubmitting] = useState(false)

  const submitReview = useCallback(
    async (reportId, { status, review_note }) => {
      setSubmitting(true)
      try {
        const payload = await reviewIntegrityReport(reportId, {
          status,
          ...(review_note?.trim() ? { review_note: review_note.trim() } : {}),
        })
        return normalizeIntegrityReport(payload.report || payload)
      } catch (err) {
        throw new Error(err.message || t('errors.reviewFailed'))
      } finally {
        setSubmitting(false)
      }
    },
    [t],
  )

  return { submitReview, submitting }
}
