import api from '../lib/axios'
import { normalizeWorkspaceTeacher } from '../lib/workspaceTeachers'

export async function getWorkspaceTeachers() {
  const { data } = await api.get('/workspaces/teachers')
  const teachers = (data.data || []).map(normalizeWorkspaceTeacher)
  return { ...data, data: teachers }
}
