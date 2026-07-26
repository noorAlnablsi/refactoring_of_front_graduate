import api from '../lib/axios'

export async function getWorkspaceGroups() {
  const { data } = await api.get('/workspaces/groups')
  return data
}

export async function getSubjectGroups(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/groups`)
  return data
}

export async function getAvailableGroupStudents(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/groups/available-students`)
  return data
}

export async function createSubjectGroup(subjectId, payload) {
  const { data } = await api.post(`/subjects/${subjectId}/groups`, payload)
  return data
}

export async function getGroupDetails(groupId) {
  const { data } = await api.get(`/groups/${groupId}`)
  return data
}

export async function updateGroup(groupId, payload) {
  const { data } = await api.put(`/groups/${groupId}`, payload)
  return data
}

export async function deleteGroup(groupId) {
  const { data } = await api.delete(`/groups/${groupId}`)
  return data
}

export async function addGroupMembers(groupId, studentIds) {
  const { data } = await api.post(`/groups/${groupId}/members`, {
    student_ids: studentIds,
  })
  return data
}

export async function removeGroupMember(groupId, membershipId) {
  const { data } = await api.delete(`/groups/${groupId}/members/${membershipId}`)
  return data
}
