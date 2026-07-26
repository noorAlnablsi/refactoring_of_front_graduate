import api from '../lib/axios'

/** POST /reports — create a support report */
export async function createReport(payload) {
  const { data } = await api.post('/reports', payload)
  return data
}
