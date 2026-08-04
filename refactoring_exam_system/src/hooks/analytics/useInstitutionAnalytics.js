import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildDateRangePreset,
  normalizeInstitutionAnalytics,
  toAnalyticsDateFrom,
  toAnalyticsDateTo,
} from '../../lib/institutionAnalyticsModel'
import { isInstitutionOwner } from '../../lib/workspaceContext'
import { getWorkspaceAnalytics } from '../../services/workspaces.service'
import { getSubjects } from '../../services/subjects.service'
import { getWorkspaceTeachers } from '../../services/workspaces.service'
import { getIntegrityReports } from '../../services/proctoring/integrityReports.service'
import { normalizeIntegrityReportsList } from '../../lib/integrityReportsModel'

const EMPTY = normalizeInstitutionAnalytics({})

export function useInstitutionAnalytics() {
  const { t } = useTranslation('analytics')
  const canAccess = isInstitutionOwner()

  const defaultRange = useMemo(() => buildDateRangePreset('30d'), [])
  const [datePreset, setDatePreset] = useState('30d')
  const [dateFrom, setDateFrom] = useState(defaultRange?.date_from || '')
  const [dateTo, setDateTo] = useState(defaultRange?.date_to || '')
  const [subjectId, setSubjectId] = useState('')
  const [teacherMembershipId, setTeacherMembershipId] = useState('')

  const [data, setData] = useState(EMPTY)
  const [integrityPreview, setIntegrityPreview] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(canAccess)
  const [filtersLoading, setFiltersLoading] = useState(canAccess)
  const [error, setError] = useState('')

  const queryParams = useMemo(() => {
    const params = {}
    const from = toAnalyticsDateFrom(dateFrom)
    const to = toAnalyticsDateTo(dateTo)
    if (from) params.date_from = from
    if (to) params.date_to = to
    if (subjectId) params.subject_id = Number(subjectId)
    if (teacherMembershipId) params.teacher_membership_id = Number(teacherMembershipId)
    return params
  }, [dateFrom, dateTo, subjectId, teacherMembershipId])

  const applyDatePreset = useCallback((preset) => {
    setDatePreset(preset)
    if (preset === 'custom') return
    const range = buildDateRangePreset(preset)
    if (!range) return
    setDateFrom(range.date_from)
    setDateTo(range.date_to)
  }, [])

  const refetch = useCallback(async () => {
    if (!isInstitutionOwner()) {
      setData(EMPTY)
      setIntegrityPreview([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const [analyticsPayload, integrityPayload] = await Promise.all([
        getWorkspaceAnalytics(queryParams),
        getIntegrityReports({
          page: 1,
          per_page: 5,
          ...(queryParams.date_from ? { date_from: queryParams.date_from } : {}),
          ...(queryParams.date_to ? { date_to: queryParams.date_to } : {}),
          ...(queryParams.subject_id ? { subject_id: queryParams.subject_id } : {}),
        }).catch(() => ({ reports: [] })),
      ])

      setData(normalizeInstitutionAnalytics(analyticsPayload))
      setIntegrityPreview(normalizeIntegrityReportsList(integrityPayload).reports)
    } catch (err) {
      setData(EMPTY)
      setIntegrityPreview([])
      setError(err.message || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [queryParams, t])

  useEffect(() => {
    if (!canAccess) {
      setLoading(false)
      setFiltersLoading(false)
      return undefined
    }

    let cancelled = false
    setFiltersLoading(true)

    Promise.all([
      getSubjects().catch(() => ({ subjects: [] })),
      getWorkspaceTeachers({ page: 1, per_page: 100 }).catch(() => ({ teachers: [] })),
    ])
      .then(([subjectsPayload, teachersPayload]) => {
        if (cancelled) return
        setSubjects(subjectsPayload.subjects || [])
        setTeachers(teachersPayload.teachers || [])
      })
      .finally(() => {
        if (!cancelled) setFiltersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [canAccess])

  useEffect(() => {
    if (!canAccess) return undefined
    let cancelled = false

    setLoading(true)
    setError('')

    Promise.all([
      getWorkspaceAnalytics(queryParams),
      getIntegrityReports({
        page: 1,
        per_page: 5,
        ...(queryParams.date_from ? { date_from: queryParams.date_from } : {}),
        ...(queryParams.date_to ? { date_to: queryParams.date_to } : {}),
        ...(queryParams.subject_id ? { subject_id: queryParams.subject_id } : {}),
      }).catch(() => ({ reports: [] })),
    ])
      .then(([analyticsPayload, integrityPayload]) => {
        if (cancelled) return
        setData(normalizeInstitutionAnalytics(analyticsPayload))
        setIntegrityPreview(normalizeIntegrityReportsList(integrityPayload).reports)
      })
      .catch((err) => {
        if (cancelled) return
        setData(EMPTY)
        setIntegrityPreview([])
        setError(err.message || t('errors.loadFailed'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [canAccess, queryParams, t])

  return {
    canAccess,
    ...data,
    integrityPreview,
    subjects,
    teachers,
    filtersLoading,
    datePreset,
    dateFrom,
    dateTo,
    subjectId,
    teacherMembershipId,
    setSubjectId,
    setTeacherMembershipId,
    setDateFrom,
    setDateTo,
    applyDatePreset,
    loading,
    error,
    refetch,
  }
}
