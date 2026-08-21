import api from '../lib/axios'
import { normalizeWorkspace } from '../lib/workspace'
import {
  mapDashboardMemberToWorkspaceStudent,
  normalizeWorkspaceStudentsResponse,
} from '../lib/workspaceStudents'
import { isSoloTeacher } from '../lib/workspaceContext'
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
  return normalizeWorkspaceStudentsResponse(data)
}

export async function getWorkspaceStudentsWithSoloFallback(params = {}) {
  let primary
  try {
    primary = await getWorkspaceStudents(params)
  } catch (err) {
    if (!isSoloTeacher()) throw err
    primary = { students: [], total: 0, count: 0, pages: 1 }
  }

  if ((primary.total ?? 0) > 0 || (primary.students || []).length > 0) {
    return primary
  }

  if (!isSoloTeacher()) {
    return primary
  }

  try {
    const search = typeof params.search === 'string' ? params.search.trim().toLowerCase() : ''
    const page = Math.max(Number(params.page) || 1, 1)
    const perPage = Math.max(Number(params.per_page) || 10, 1)

    const dashboard = await getWorkspaceDashboard({
      recent_limit: 200,
      upcoming_limit: 1,
    })

    let students = (dashboard.recent_members || [])
      .map(mapDashboardMemberToWorkspaceStudent)
      .filter(Boolean)

    const overviewTotalRaw =
      dashboard.overview?.total_students ?? dashboard.overview?.students_count
    const overviewTotal = Number(overviewTotalRaw)
    const hasOverviewTotal = Number.isFinite(overviewTotal) && overviewTotal >= 0

    const membersTotal = Number(dashboard.overview?.total_members)
    const inferredFromMembers =
      Number.isFinite(membersTotal) && membersTotal > 0 ? Math.max(0, membersTotal - 1) : null

    if (students.length === 0 && !hasOverviewTotal && inferredFromMembers == null) {
      return primary
    }

    if (search) {
      students = students.filter((student) => {
        const name = String(student.full_name || '').toLowerCase()
        const email = String(student.email || '').toLowerCase()
        return name.includes(search) || email.includes(search)
      })
    }

    const total = search
      ? students.length
      : hasOverviewTotal
        ? overviewTotal
        : students.length > 0
          ? students.length
          : inferredFromMembers ?? 0

    if (total <= 0 && students.length === 0) {
      return primary
    }

    const start = (page - 1) * perPage
    const pageRows = students.slice(start, start + perPage)

    return {
      ...primary,
      students: pageRows,
      total,
      count: total,
      pages: Math.max(1, Math.ceil(Math.max(total, 1) / perPage)),
      _fromDashboardFallback: true,
    }
  } catch {
    return primary
  }
}

export async function getWorkspaceTeachers(params = {}) {
  const { data } = await api.get('/workspaces/teachers', { params })
  const teachers = (data.teachers || data.data || []).map(normalizeWorkspaceTeacher)
  return { ...data, teachers }
}

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

export async function getWorkspaceDashboard(params = {}) {
  const { data } = await api.get('/workspaces/dashboard', { params })
  return data
}

export async function getTeacherDashboard(params = {}) {
  const query = {}
  if (params.recent_limit != null) query.recent_limit = params.recent_limit
  if (params.upcoming_limit != null) query.upcoming_limit = params.upcoming_limit
  const { data } = await api.get('/workspaces/teacher-dashboard', { params: query })
  return data
}

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

export async function exportWorkspaceStudentsCsv({ search } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return downloadWorkspaceCsv('/workspaces/students/export', {
    search,
    fallbackFilename: `students_${today}.csv`,
  })
}

export async function exportWorkspaceTeachersCsv({ search } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return downloadWorkspaceCsv('/workspaces/teachers/export', {
    search,
    fallbackFilename: `teachers_${today}.csv`,
  })
}

export async function importWorkspaceMembersCsv(csvFile) {
  const formData = new FormData()
  formData.append('csv_file', csvFile)

  const { data } = await api.post('/workspaces/members/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

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
