import api from '../lib/axios'

export async function getTeacherMembershipSubjects(membershipId) {
  const { data } = await api.get(`/teacher-memberships/${membershipId}/subjects`)
  return data
}

export async function replaceTeacherMembershipSubjects(membershipId, subjectIds) {
  const { data } = await api.put(`/teacher-memberships/${membershipId}/subjects`, {
    subject_ids: subjectIds,
  })
  return data
}
