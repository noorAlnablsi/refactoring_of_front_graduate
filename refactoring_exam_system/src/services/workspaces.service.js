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

/** PATCH /workspaces/{id} — owner/admin (SOLO admin included). */
export async function updateWorkspace(workspaceId, payload) {
  const { data } = await api.patch(`/workspaces/${workspaceId}`, payload)
  return data
}

export async function deleteWorkspace(workspaceId) {
  const { data } = await api.delete(`/workspaces/${workspaceId}`)
  return data
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

/** Institution workspace exams list (owner/admin/teacher with access). */
export async function getWorkspaceTests(params = {}) {
  const { data } = await api.get('/workspaces/tests', { params })
  return data
}

/** Workspace admin dashboard (INSTITUTION + SOLO owner/admin). */
export async function getWorkspaceDashboard(params = {}) {
  const { data } = await api.get('/workspaces/dashboard', { params })
  return data
}

/** Institution analytics (INSTITUTION owner only). */
export async function getWorkspaceAnalytics(params = {}) {
  const { data } = await api.get('/workspaces/analytics', { params })
  return data
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
