import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import {
  fetchTestsForActiveWorkspace,
  filterTestsBySubjectId,
} from '../../lib/fetchWorkspaceTests'
import { sortByRecentDate } from '../../lib/subjectDisplay'
import {
  getSubjectById,
  getSubjectQuestionBanks,
  getSubjectStudents,
  getSubjectTeachers,
  getSubjectTopics,
} from '../../services/subjects.service'

export function useSubjectDetails(subjectId) {
  const { t } = useTranslation('subjects')
  const [subject, setSubject] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [questionBanks, setQuestionBanks] = useState([])
  const [questionBanksCount, setQuestionBanksCount] = useState(0)
  const [topics, setTopics] = useState([])
  const [topicsCount, setTopicsCount] = useState(0)
  const [students, setStudents] = useState([])
  const [studentsCount, setStudentsCount] = useState(0)
  const [tests, setTests] = useState([])
  const [testsLoading, setTestsLoading] = useState(true)
  const [testsError, setTestsError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const applyStudentsPayload = (studentsData) => {
    const list = studentsData.students || studentsData.enrollments || studentsData.assignments || []
    setStudents(list)
    setStudentsCount(studentsData.count ?? list.length)
  }

  const applyCorePayload = ([subjectData, teachersData, banksData, studentsData, topicsData]) => {
    setSubject(subjectData)
    setTeachers(teachersData.teachers || [])
    setQuestionBanks(banksData.question_banks || [])
    setQuestionBanksCount(banksData.count ?? banksData.question_banks?.length ?? 0)
    setTopics(topicsData.topics || [])
    setTopicsCount(topicsData.count ?? topicsData.topics?.length ?? 0)
    applyStudentsPayload(studentsData)
  }

  const loadSubjectTests = useCallback(async (id) => {
    setTestsLoading(true)
    setTestsError('')
    try {
      const allTests = await fetchTestsForActiveWorkspace()
      const subjectTests = sortByRecentDate(
        filterTestsBySubjectId(allTests, id),
        ['updated_at', 'created_at', 'published_at'],
      )
      setTests(subjectTests)
    } catch (err) {
      setTests([])
      setTestsError(translateBackendMessage(err.message) || t('errors.loadExamsFailed'))
    } finally {
      setTestsLoading(false)
    }
  }, [t])

  const fetchDetails = useCallback(async () => {
    if (!subjectId) return
    setLoading(true)
    setError('')
    try {
      const payload = await Promise.all([
        getSubjectById(subjectId),
        getSubjectTeachers(subjectId),
        getSubjectQuestionBanks(subjectId),
        getSubjectStudents(subjectId),
        getSubjectTopics(subjectId),
      ])
      applyCorePayload(payload)
      await loadSubjectTests(subjectId)
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('errors.loadDetailsFailed'))
    } finally {
      setLoading(false)
    }
  }, [subjectId, t, loadSubjectTests])

  useEffect(() => {
    if (!subjectId) return undefined

    let cancelled = false

    Promise.all([
      getSubjectById(subjectId),
      getSubjectTeachers(subjectId),
      getSubjectQuestionBanks(subjectId),
      getSubjectStudents(subjectId),
      getSubjectTopics(subjectId),
    ])
      .then((payload) => {
        if (cancelled) return
        applyCorePayload(payload)
      })
      .catch((err) => {
        if (cancelled) return
        setError(translateBackendMessage(err.message) || t('errors.loadDetailsFailed'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    loadSubjectTests(subjectId).finally(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [subjectId, t, loadSubjectTests])

  return {
    subject,
    teachers,
    questionBanks,
    questionBanksCount,
    topics,
    topicsCount,
    students,
    studentsCount,
    tests,
    testsLoading,
    testsError,
    loading,
    error,
    refetch: fetchDetails,
  }
}
