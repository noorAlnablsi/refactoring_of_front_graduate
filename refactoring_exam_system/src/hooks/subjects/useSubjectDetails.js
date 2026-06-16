import { useCallback, useEffect, useState } from 'react'
import {
  getSubjectById,
  getSubjectQuestionBanks,
  getSubjectStudents,
  getSubjectTeachers,
} from '../../services/subjects.service'

export function useSubjectDetails(subjectId) {
  const [subject, setSubject] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [questionBanks, setQuestionBanks] = useState([])
  const [questionBanksCount, setQuestionBanksCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDetails = useCallback(async () => {
    if (!subjectId) return
    setLoading(true)
    setError('')
    try {
      const [subjectData, teachersData, banksData, studentsData] = await Promise.all([
        getSubjectById(subjectId),
        getSubjectTeachers(subjectId),
        getSubjectQuestionBanks(subjectId),
        getSubjectStudents(subjectId),
      ])
      setSubject(subjectData)
      setTeachers(teachersData.teachers || [])
      setQuestionBanks(banksData.question_banks || [])
      setQuestionBanksCount(banksData.count ?? banksData.question_banks?.length ?? 0)
      setStudentsCount(studentsData.count ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    if (!subjectId) return undefined

    let cancelled = false

    Promise.all([
      getSubjectById(subjectId),
      getSubjectTeachers(subjectId),
      getSubjectQuestionBanks(subjectId),
      getSubjectStudents(subjectId),
    ])
      .then(([subjectData, teachersData, banksData, studentsData]) => {
        if (cancelled) return
        setSubject(subjectData)
        setTeachers(teachersData.teachers || [])
        setQuestionBanks(banksData.question_banks || [])
        setQuestionBanksCount(banksData.count ?? banksData.question_banks?.length ?? 0)
        setStudentsCount(studentsData.count ?? 0)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [subjectId])

  return {
    subject,
    teachers,
    questionBanks,
    questionBanksCount,
    studentsCount,
    loading,
    error,
    refetch: fetchDetails,
  }
}
