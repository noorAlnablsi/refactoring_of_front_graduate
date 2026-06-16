import api from '../lib/axios'

export async function getSubjects() {
  const { data } = await api.get('/subjects')
  return data
}

export async function createSubject(payload) {
  const { data } = await api.post('/subjects', payload)
  return data
}

export async function getSubjectById(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}`)
  return data
}

export async function updateSubject(subjectId, payload) {
  const { data } = await api.patch(`/subjects/${subjectId}`, payload)
  return data
}

export async function getSubjectTeachers(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/teachers`)
  return data
}

export async function assignTeacherToSubject(subjectId, membershipId) {
  const { data } = await api.post(`/subjects/${subjectId}/teachers`, {
    membership_id: membershipId,
  })
  return data
}

export async function removeTeacherFromSubject(subjectId, membershipId) {
  const { data } = await api.delete(`/subjects/${subjectId}/teachers/${membershipId}`)
  return data
}

export async function getSubjectQuestionBanks(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/question-banks`)
  return data
}

export async function getSubjectStudents(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/students`)
  return data
}
