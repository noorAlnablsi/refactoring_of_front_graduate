import { useCallback, useEffect, useRef, useState } from 'react'
import { isEssayQuestion, isMultiSelectQuestion } from '../../lib/attemptAnswers'
import {
  buildSurveyAnswersMap,
  buildSurveyAnswersPayload,
  countAnsweredSurveyQuestions,
  isSurveyResponseInProgress,
  isSurveyResponseSubmitted,
} from '../../lib/surveyResponses'
import {
  getSurveyForRespondent,
  saveSurveyResponseAnswers,
  startOrResumeSurveyResponse,
  submitSurveyResponse,
} from '../../services/surveys.service'

const SAVE_DEBOUNCE_MS = 700

export function useSurveyRespond(surveyId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [survey, setSurvey] = useState(null)
  const [questions, setQuestions] = useState([])
  const [response, setResponse] = useState(null)
  const [answersMap, setAnswersMap] = useState({})
  const [phase, setPhase] = useState('loading') // loading | intro | answering | completed
  const [starting, setStarting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const saveTimerRef = useRef(null)
  const answersRef = useRef(answersMap)
  const questionsRef = useRef(questions)
  const responseRef = useRef(response)

  answersRef.current = answersMap
  questionsRef.current = questions
  responseRef.current = response

  const applyPayload = useCallback((data) => {
    const nextSurvey = data?.survey || null
    const nextQuestions = Array.isArray(data?.questions) ? data.questions : []
    const nextResponse = data?.my_response ?? data?.response ?? null

    setSurvey(nextSurvey)
    if (nextQuestions.length) setQuestions(nextQuestions)
    setResponse(nextResponse)

    if (nextResponse?.answers) {
      setAnswersMap(buildSurveyAnswersMap(nextResponse.answers))
    }

    if (isSurveyResponseSubmitted(nextResponse)) {
      setPhase('completed')
      setDirty(false)
      return
    }

    if (isSurveyResponseInProgress(nextResponse)) {
      setPhase('answering')
      setDirty(false)
      return
    }

    setPhase('intro')
    setDirty(false)
  }, [])

  const load = useCallback(async () => {
    if (!surveyId) return
    setLoading(true)
    setError('')
    try {
      const data = await getSurveyForRespondent(surveyId)
      applyPayload(data)
    } catch (err) {
      setSurvey(null)
      setQuestions([])
      setResponse(null)
      setAnswersMap({})
      setPhase('loading')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [applyPayload, surveyId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  const persistAnswers = useCallback(async () => {
    const currentResponse = responseRef.current
    const responseId = currentResponse?.response_id
    if (!surveyId || !responseId || isSurveyResponseSubmitted(currentResponse)) return false

    const answers = buildSurveyAnswersPayload(answersRef.current, questionsRef.current)
    if (!answers.length) return false

    setSaving(true)
    try {
      const data = await saveSurveyResponseAnswers(surveyId, responseId, answers)
      if (data?.response) setResponse(data.response)
      setDirty(false)
      return true
    } finally {
      setSaving(false)
    }
  }, [surveyId])

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      persistAnswers().catch(() => {})
    }, SAVE_DEBOUNCE_MS)
  }, [persistAnswers])

  const startOrResume = useCallback(async () => {
    if (!surveyId) return
    setStarting(true)
    setError('')
    try {
      const data = await startOrResumeSurveyResponse(surveyId)
      const nextQuestions = Array.isArray(data?.questions) && data.questions.length
        ? data.questions
        : questionsRef.current
      const nextResponse = data?.response || null

      if (nextQuestions.length) setQuestions(nextQuestions)
      setResponse(nextResponse)
      if (nextResponse?.answers) {
        setAnswersMap(buildSurveyAnswersMap(nextResponse.answers))
      }

      if (isSurveyResponseSubmitted(nextResponse)) {
        setPhase('completed')
      } else {
        setPhase('answering')
      }
      setDirty(false)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setStarting(false)
    }
  }, [surveyId])

  const updateChoiceAnswer = useCallback(
    (questionId, typeCode, choiceIndex) => {
      if (phase !== 'answering') return

      setAnswersMap((prev) => {
        const current = prev[questionId] || {
          test_question_id: questionId,
          selected_choice_indices: [],
          answer_text: null,
        }
        let nextIndices = Array.isArray(current.selected_choice_indices)
          ? [...current.selected_choice_indices]
          : []

        if (isMultiSelectQuestion(typeCode)) {
          if (nextIndices.includes(choiceIndex)) {
            nextIndices = nextIndices.filter((value) => value !== choiceIndex)
          } else {
            nextIndices.push(choiceIndex)
          }
        } else {
          nextIndices = [choiceIndex]
        }

        return {
          ...prev,
          [questionId]: {
            ...current,
            test_question_id: questionId,
            selected_choice_indices: nextIndices,
            answer_text: null,
          },
        }
      })
      setDirty(true)
      scheduleSave()
    },
    [phase, scheduleSave],
  )

  const updateEssayAnswer = useCallback(
    (questionId, text) => {
      if (phase !== 'answering') return

      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: {
          test_question_id: questionId,
          selected_choice_indices: null,
          answer_text: text,
        },
      }))
      setDirty(true)
      scheduleSave()
    },
    [phase, scheduleSave],
  )

  const saveNow = useCallback(async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    return persistAnswers()
  }, [persistAnswers])

  const submit = useCallback(async () => {
    const currentResponse = responseRef.current
    const responseId = currentResponse?.response_id
    if (!surveyId || !responseId) return null

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    setSubmitting(true)
    setError('')
    try {
      await persistAnswers().catch(() => {})
      const data = await submitSurveyResponse(surveyId, responseId)
      if (data?.response) {
        setResponse(data.response)
        if (data.response.answers) {
          setAnswersMap(buildSurveyAnswersMap(data.response.answers))
        }
      }
      setPhase('completed')
      setDirty(false)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [persistAnswers, surveyId])

  const answeredCount = countAnsweredSurveyQuestions(answersMap, questions)

  return {
    loading,
    error,
    survey,
    questions,
    response,
    answersMap,
    phase,
    starting,
    saving,
    submitting,
    dirty,
    answeredCount,
    reload: load,
    startOrResume,
    updateChoiceAnswer,
    updateEssayAnswer,
    saveNow,
    submit,
  }
}
