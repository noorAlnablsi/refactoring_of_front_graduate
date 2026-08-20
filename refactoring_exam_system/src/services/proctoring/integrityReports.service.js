import api from '../../lib/axios'


export async function getIntegrityReports(params = {}) {
  const { data } = await api.get('/proctoring/integrity-reports', { params })
  return data
}


export async function getIntegrityReport(reportId) {
  const { data } = await api.get(`/proctoring/integrity-reports/${reportId}`)
  return data
}


export async function reviewIntegrityReport(reportId, payload) {
  const { data } = await api.patch(`/proctoring/integrity-reports/${reportId}`, payload)
  return data
}
