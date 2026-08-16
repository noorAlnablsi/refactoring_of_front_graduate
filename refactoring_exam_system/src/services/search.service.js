import api from '../lib/axios'

/** GET /search — TopBar global quick search (workspace-scoped RBAC). */
export async function globalSearch({ q, perTypeLimit = 5 } = {}) {
  const trimmed = String(q || '').trim()
  if (!trimmed) {
    throw new Error('Search query parameter q is required')
  }

  const params = { q: trimmed }
  if (perTypeLimit != null) params.per_type_limit = perTypeLimit

  const { data } = await api.get('/search', { params })
  return data
}
