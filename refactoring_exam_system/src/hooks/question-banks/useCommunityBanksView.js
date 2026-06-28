import { useEffect, useMemo, useState } from 'react'
import { COMMUNITY_BANKS_PAGE_SIZE } from '../../constants/questionBanks'

export function useCommunityBanksView(banks, { pageSize = COMMUNITY_BANKS_PAGE_SIZE } = {}) {
  const [page, setPage] = useState(1)

  const totalCount = banks.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    setPage(1)
  }, [totalCount])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedBanks = useMemo(() => {
    const start = (page - 1) * pageSize
    return banks.slice(start, start + pageSize)
  }, [banks, page, pageSize])

  return {
    page,
    setPage,
    paginatedBanks,
    totalPages,
    totalCount,
  }
}
