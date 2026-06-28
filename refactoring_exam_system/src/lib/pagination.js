export function getPaginationItems(page, totalPages) {
  if (totalPages <= 1) return []

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: 'page',
      value: index + 1,
    }))
  }

  const items = [{ type: 'page', value: 1 }]

  if (page > 3) {
    items.push({ type: 'ellipsis' })
  }

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push({ type: 'page', value: pageNumber })
  }

  if (page < totalPages - 2) {
    items.push({ type: 'ellipsis' })
  }

  items.push({ type: 'page', value: totalPages })
  return items
}
