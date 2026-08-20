import api from '../lib/axios'
import {
  getSubjectQuestionBanksCount,
  getSubjectTeachersCount,
} from '../lib/subjectDisplay'
import { getStudentMembershipId } from '../lib/workspaceStudents'

export async function getSubjects(params = {}) {
  const query = {}
  if (params.page != null) query.page = params.page
  if (params.per_page != null) query.per_page = params.per_page
  if (params.search != null && String(params.search).trim()) {
    query.search = String(params.search).trim()
  }
  const { data } = await api.get('/subjects', { params: query })
  return data
}

export async function listAllSubjects({ search } = {}) {
  const perPage = 100
  let page = 1
  let pages = 1
  const subjects = []

  do {
    const data = await getSubjects({
      page,
      per_page: perPage,
      search: search || undefined,
    })
    const chunk = data.subjects || []
    subjects.push(...chunk)
    pages = Math.max(Number(data.pages) || 1, 1)
    if (!data.pages && chunk.length < perPage) break
    page += 1
  } while (page <= pages)

  return {
    subjects,
    count: subjects.length,
  }
}

async function fetchSubjectListStats(subjectId) {
  const [teachersResult, banksResult] = await Promise.allSettled([
    getSubjectTeachers(subjectId),
    getSubjectQuestionBanks(subjectId),
  ])

  const teachersData = teachersResult.status === 'fulfilled' ? teachersResult.value : null
  const banksData = banksResult.status === 'fulfilled' ? banksResult.value : null

  return {
    teachers_count: teachersData?.count ?? teachersData?.teachers?.length ?? 0,
    question_banks_count: banksData?.count ?? banksData?.question_banks?.length ?? 0,
  }
}

export async function getSubjectsWithStats({ search } = {}) {
  const data = await listAllSubjects({ search })
  const subjects = data.subjects || []

  const enrichedSubjects = await Promise.all(
    subjects.map(async (subject) => {
      const teachersCount = getSubjectTeachersCount(subject)
      const banksCount = getSubjectQuestionBanksCount(subject)

      if (teachersCount != null && banksCount != null) {
        return subject
      }

      const stats = await fetchSubjectListStats(subject.id)
      return {
        ...subject,
        teachers_count: teachersCount ?? stats.teachers_count,
        question_banks_count: banksCount ?? stats.question_banks_count,
      }
    }),
  )

  return { ...data, subjects: enrichedSubjects }
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

export async function deleteSubject(subjectId) {
  const { data } = await api.patch(`/subjects/${subjectId}`, { is_archived: true })
  return data
}

export async function getSubjectTeachers(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/teachers`)
  return data
}

export async function assignTeacherToSubject(subjectId, teacherOrMembershipId) {
  const body =
    typeof teacherOrMembershipId === 'object'
      ? teacherOrMembershipId.membership_id
        ? { membership_id: teacherOrMembershipId.membership_id }
        : teacherOrMembershipId.user_id
          ? { user_id: teacherOrMembershipId.user_id }
          : null
      : { membership_id: teacherOrMembershipId }

  if (!body) {
    throw new Error('تعذّر تحديد المعلم — تأكد أن API يُرجع membership_id')
  }

  const { data } = await api.post(`/subjects/${subjectId}/teachers`, body)
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

export async function getSubjectStudents(subjectId, { search } = {}) {
  const params = {}
  if (search != null && String(search).trim()) params.search = String(search).trim()
  const { data } = await api.get(`/subjects/${subjectId}/students`, { params })
  return data
}

function normalizeSubjectId(subjectId) {
  const normalizedSubjectId = Number(subjectId)
  if (!Number.isFinite(normalizedSubjectId)) {
    throw new Error('تعذّر تحديد المادة')
  }
  return normalizedSubjectId
}

function resolveMembershipIds(studentOrMembershipIds) {
  const rawList = Array.isArray(studentOrMembershipIds)
    ? studentOrMembershipIds
    : [studentOrMembershipIds]

  const membershipIds = [
    ...new Set(
      rawList
        .map((item) =>
          typeof item === 'object' ? getStudentMembershipId(item) : Number(item),
        )
        .filter((id) => Number.isFinite(id) && id > 0),
    ),
  ]

  if (membershipIds.length === 0) {
    throw new Error('تعذّر تحديد الطالب — تأكد أن API يُرجع membership_id')
  }

  return membershipIds
}

export async function assignStudentToSubject(subjectId, studentOrMembershipId) {
  return assignStudentsToSubject(subjectId, studentOrMembershipId)
}

export async function assignStudentsToSubject(subjectId, studentOrMembershipIds) {
  const membershipIds = resolveMembershipIds(studentOrMembershipIds)
  const { data } = await api.post(`/subjects/${normalizeSubjectId(subjectId)}/students`, {
    membership_ids: membershipIds,
  })
  return data
}

export async function removeStudentFromSubject(subjectId, membershipId) {
  const { data } = await api.delete(`/subjects/${subjectId}/students/${membershipId}`)
  return data
}

export async function getSubjectTopics(subjectId) {
  const { data } = await api.get(`/subjects/${subjectId}/topics`)
  return data
}

export async function createSubjectTopic(subjectId, payload) {
  const { data } = await api.post(`/subjects/${subjectId}/topics`, payload)
  return data
}

export async function updateSubjectTopic(subjectId, topicId, payload) {
  const { data } = await api.patch(`/subjects/${subjectId}/topics/${topicId}`, payload)
  return data
}

export async function deleteSubjectTopic(subjectId, topicId) {
  const { data } = await api.delete(`/subjects/${subjectId}/topics/${topicId}`)
  return data
}
