import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GROUPS_PAGE_SIZE } from '../../constants/groups'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { normalizeStudentGroup } from '../../lib/studentGroupsModel'
import { resolveTeacherAssignedSubjects } from '../../lib/teacherSubjects'
import {
  canMutateStudentGroups,
  getActiveMembership,
  isSoloTeacher,
} from '../../lib/workspaceContext'
import { getSubjects } from '../../services/subjects.service'
import { getWorkspaceGroups } from '../../services/studentGroups.service'

function sortGroups(list, sortKey) {
  const copy = [...list]
  if (sortKey === 'name') {
    return copy.sort((a, b) =>
      String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }),
    )
  }
  if (sortKey === 'oldest') {
    return copy.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  }
  return copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

async function loadSubjectsForMembership(membership, canMutate) {
  // Teachers (and mutating SOLO): prefer assigned-subjects resolution with fallbacks.
  if (canMutate && membership?.membership_id) {
    const assigned = await resolveTeacherAssignedSubjects(membership.membership_id)
    if (assigned.length) return assigned
  }

  if (membership?.role === 'TEACHER') {
    return []
  }

  try {
    const subjectsRes = await getSubjects()
    return (subjectsRes.subjects || [])
      .filter((subject) => !subject.is_archived)
      .map((subject) => ({
        id: Number(subject.id),
        name: String(subject.name || subject.title || '').trim() || `#${subject.id}`,
        is_archived: false,
      }))
      .filter((subject) => Number.isFinite(subject.id))
  } catch {
    return []
  }
}

export function useStudentGroupsPage() {
  const { t } = useTranslation('groups')
  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignableSubjects, setAssignableSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [sortKey, setSortKey] = useState('newest')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const canMutate = canMutateStudentGroups()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const membership = getActiveMembership()
      const [groupsRes, activeSubjects] = await Promise.all([
        getWorkspaceGroups(),
        loadSubjectsForMembership(membership, canMutate),
      ])
      const normalized = (groupsRes.groups || []).map(normalizeStudentGroup).filter(Boolean)

      let createSubjects = []
      if (canMutate) {
        createSubjects = activeSubjects
        if (!createSubjects.length && isSoloTeacher()) {
          try {
            const subjectsRes = await getSubjects()
            createSubjects = (subjectsRes.subjects || [])
              .filter((subject) => !subject.is_archived)
              .map((subject) => ({
                id: Number(subject.id),
                name: String(subject.name || subject.title || '').trim() || `#${subject.id}`,
                is_archived: false,
              }))
          } catch {
            createSubjects = []
          }
        }
      }
      setAssignableSubjects(createSubjects)

      const assignedIdSet = new Set(createSubjects.map((subject) => Number(subject.id)))
      const subjectMap = new Map(activeSubjects.map((subject) => [Number(subject.id), subject]))
      normalized.forEach((group) => {
        if (group.subjectId != null && !subjectMap.has(Number(group.subjectId))) {
          subjectMap.set(Number(group.subjectId), {
            id: group.subjectId,
            name: group.subject?.name || `#${group.subjectId}`,
            is_archived: false,
          })
        }
      })

      const tabSubjects = [...subjectMap.values()]
        .filter((subject) => {
          if (membership?.role === 'TEACHER') {
            return assignedIdSet.size ? assignedIdSet.has(Number(subject.id)) : true
          }
          return true
        })
        .sort((a, b) =>
          String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }),
        )

      setGroups(normalized)
      setSubjects(tabSubjects)
      setSelectedSubjectId((prev) => {
        if (prev && tabSubjects.some((s) => String(s.id) === String(prev))) return String(prev)
        return tabSubjects[0] ? String(tabSubjects[0].id) : ''
      })
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('errors.loadFailed'))
      setGroups([])
      setSubjects([])
      setAssignableSubjects([])
    } finally {
      setLoading(false)
    }
  }, [canMutate, t])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const filteredGroups = useMemo(() => {
    let list = groups
    if (selectedSubjectId) {
      list = list.filter((group) => Number(group.subjectId) === Number(selectedSubjectId))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((group) => {
        const name = String(group.name || '').toLowerCase()
        const subjectName = String(group.subject?.name || '').toLowerCase()
        const ownerName = String(group.ownerName || '').toLowerCase()
        return name.includes(q) || subjectName.includes(q) || ownerName.includes(q)
      })
    }
    return sortGroups(list, sortKey)
  }, [groups, selectedSubjectId, sortKey, search])

  const totalCount = filteredGroups.length
  const totalPages = Math.max(1, Math.ceil(totalCount / GROUPS_PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [selectedSubjectId, sortKey, search, totalCount])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * GROUPS_PAGE_SIZE
    return filteredGroups.slice(start, start + GROUPS_PAGE_SIZE)
  }, [filteredGroups, page])

  const rangeStart = totalCount ? (page - 1) * GROUPS_PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(page * GROUPS_PAGE_SIZE, totalCount)

  return {
    groups: paginatedGroups,
    subjects,
    assignableSubjects,
    canMutate,
    loading,
    error,
    selectedSubjectId,
    setSelectedSubjectId,
    sortKey,
    setSortKey,
    searchInput,
    setSearchInput,
    search,
    page,
    setPage,
    totalPages,
    totalCount,
    rangeStart,
    rangeEnd,
    refetch: fetchAll,
  }
}
