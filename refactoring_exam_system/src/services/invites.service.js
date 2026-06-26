import api from '../lib/axios'

export async function createInvite(payload) {
  const { data } = await api.post('/invites', payload)
  return data
}

export async function getInvitePreview(token) {
  const { data } = await api.get(`/invites/${token}`)
  return data
}

export async function registerViaInvite(token, payload) {
  const { data } = await api.post(`/invites/${token}/register`, payload)
  return data
}

export async function acceptInvite(token) {
  const { data } = await api.post(`/invites/${token}/accept`)
  return data
}

export async function rejectInvite(token) {
  const { data } = await api.post(`/invites/${token}/reject`)
  return data
}
