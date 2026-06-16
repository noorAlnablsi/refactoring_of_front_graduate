import api from '../lib/axios'

export async function registerStudent(payload) {
  const { data } = await api.post('/join-codes/register-student', payload)
  return data
}

export async function joinWorkspaceByCode(payload) {
  const { data } = await api.post('/join-codes/join', payload)
  return data
}
