import api from '../lib/axios'

export async function createReport(payload) {
  const { data } = await api.post('/reports', payload)
  return data
}
