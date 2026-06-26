import { useEffect, useMemo, useState } from 'react'
import { SUBJECTS_PAGE_SIZE } from '../../constants/subjects'
import { sortSubjects } from '../../lib/subjectDisplay'

export function useSubjectsListView(subjects, { pageSize = SUBJECTS_PAGE_SIZE, initialSort = 'newest' } = {}) {
  const [sortKey, setSortKey] = useState(initialSort)
  const [page, setPage] = useState(1)

  const sortedSubjects = useMemo(() => sortSubjects(subjects, sortKey), [subjects, sortKey])
  const totalCount = sortedSubjects.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    setPage(1)
  }, [sortKey, totalCount])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedSubjects = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedSubjects.slice(start, start + pageSize)
  }, [sortedSubjects, page, pageSize])

  const rangeStart = totalCount ? (page - 1) * pageSize + 1 : 0
  const rangeEnd = Math.min(page * pageSize, totalCount)

  return {
    sortKey,
    setSortKey,
    page,
    setPage,
    paginatedSubjects,
    totalPages,
    totalCount,
    rangeStart,
    rangeEnd,
  }
}
