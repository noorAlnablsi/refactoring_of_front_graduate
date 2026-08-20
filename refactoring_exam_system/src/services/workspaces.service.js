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

export async function getWorkspaceJoinCode(workspaceId) {
  const workspace = await getWorkspace(workspaceId)
  return workspace.join_code || ''
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

/** Institution workspace exams list (owner/admin only — teachers use GET /tests/my). */
export async function getWorkspaceTests(params = {}) {
  const query = {}
  if (params.page != null) query.page = params.page
  if (params.per_page != null) query.per_page = params.per_page
  if (params.include_archived != null) query.include_archived = Boolean(params.include_archived)
  if (params.status != null && String(params.status).trim()) {
    query.status = String(params.status).trim().toUpperCase()
  }
  if (params.search != null && String(params.search).trim()) {
    query.search = String(params.search).trim()
  }
  const { data } = await api.get('/workspaces/tests', { params: query })
  return data
}

/** Workspace admin dashboard (INSTITUTION + SOLO owner/admin). */
export async function getWorkspaceDashboard(params = {}) {
  const { data } = await api.get('/workspaces/dashboard', { params })
  return data
}

/** Teacher-scoped dashboard — GET /workspaces/teacher-dashboard. */
export async function getTeacherDashboard(params = {}) {
  const query = {}
  if (params.recent_limit != null) query.recent_limit = params.recent_limit
  if (params.upcoming_limit != null) query.upcoming_limit = params.upcoming_limit
  const { data } = await api.get('/workspaces/teacher-dashboard', { params: query })
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

function filenameFromDisposition(disposition, fallback) {
  const matched = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition || '')
  if (!matched?.[1]) return fallback
  return matched[1].replace(/['"]/g, '')
}

async function downloadWorkspaceCsv(path, { search, fallbackFilename }) {
  const params = {}
  const trimmed = typeof search === 'string' ? search.trim() : ''
  if (trimmed) params.search = trimmed

  const response = await api.get(path, {
    params,
    responseType: 'blob',
    headers: { Accept: 'text/csv' },
  })

  const filename = filenameFromDisposition(
    response.headers?.['content-disposition'],
    fallbackFilename,
  )

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)

  return { filename }
}

/** GET /workspaces/students/export — workspace owner only. */
export async function exportWorkspaceStudentsCsv({ search } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return downloadWorkspaceCsv('/workspaces/students/export', {
    search,
    fallbackFilename: `students_${today}.csv`,
  })
}

/** GET /workspaces/teachers/export — institution owner only. */
export async function exportWorkspaceTeachersCsv({ search } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return downloadWorkspaceCsv('/workspaces/teachers/export', {
    search,
    fallbackFilename: `teachers_${today}.csv`,
  })
}

/** POST /workspaces/members/import-csv — multipart field `csv_file`. */
export async function importWorkspaceMembersCsv(csvFile) {
  const formData = new FormData()
  formData.append('csv_file', csvFile)

  const { data } = await api.post('/workspaces/members/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** GET /templates/workspace-members-csv */
export async function downloadWorkspaceMembersCsvTemplate() {
  const response = await api.get('/templates/workspace-members-csv', {
    responseType: 'blob',
    headers: { Accept: 'text/csv' },
  })

  const filename = filenameFromDisposition(
    response.headers?.['content-disposition'],
    'workspace_members_template.csv',
  )

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)

  return { filename }
}
