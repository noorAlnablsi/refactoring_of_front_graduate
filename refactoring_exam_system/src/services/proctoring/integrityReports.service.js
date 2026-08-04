import api from '../../lib/axios'

/** GET /proctoring/integrity-reports */
export async function getIntegrityReports(params = {}) {
  const { data } = await api.get('/proctoring/integrity-reports', { params })
  return data
}

/** GET /proctoring/integrity-reports/{id} */
export async function getIntegrityReport(reportId) {
  const { data } = await api.get(`/proctoring/integrity-reports/${reportId}`)
  return data
}

/**
 * PATCH /proctoring/integrity-reports/{id}
 * body: { status: 'CONFIRMED' | 'DISMISSED', review_note?: string }
 */
export async function reviewIntegrityReport(reportId, payload) {
  const { data } = await api.patch(`/proctoring/integrity-reports/${reportId}`, payload)
  return data
}
