import api from '../lib/axios'

export async function getMyProfile() {
  const { data } = await api.get('/users/me')
  return data.user || data
}

export async function updateMyProfile(payload) {
  const { data } = await api.patch('/users/me', payload)
  return data
}

/** Soft-delete authenticated account (sessions revoked; restoreable by SUPER_ADMIN within ~1 month). */
export async function deleteMyAccount() {
  const { data } = await api.delete('/users/me')
  return data
}

export async function getUserMemberships(userId) {
  const { data } = await api.get(`/users/${userId}/memberships`)
  return data
}
