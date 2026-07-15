import api from '../lib/axios'
import { normalizeWorkspace } from '../lib/workspace'
import { normalizeWorkspaceStudent } from '../lib/workspaceMembers'
import { normalizeWorkspaceTeacher } from '../lib/workspaceTeachers'

export async function createWorkspace(payload) {
  const { data } = await api.post('/workspaces', payload)
  return data
}

export async function getWorkspace(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}`)
  return normalizeWorkspace(data)
}

export async function getWorkspaceStudents(params = {}) {
  const { data } = await api.get('/workspaces/students', { params })
  const students = (data.students || []).map(normalizeWorkspaceStudent)
  return { ...data, students }
}

export async function getWorkspaceTeachers(params = {}) {
  const { data } = await api.get('/workspaces/teachers', { params })
  const teachers = (data.teachers || data.data || []).map(normalizeWorkspaceTeacher)
  return { ...data, teachers }
}

export async function removeWorkspaceTeacher(membershipId) {
  const { data } = await api.delete('/workspaces/teachers', {
    params: { membership_id: membershipId },
  })
  return data
}

export async function updateWorkspaceMember(membershipId, payload) {
  const { data } = await api.patch(`/workspaces/members/${membershipId}`, payload)
  return data
}
