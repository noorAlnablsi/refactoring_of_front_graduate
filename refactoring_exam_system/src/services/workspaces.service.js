import api from '../lib/axios'

export async function getWorkspaceTeachers() {
  const { data } = await api.get('/workspaces/teachers')
  return data
}
