import api from '../lib/axios'


export async function getManagedSurveys(params = {}) {
  const query = {}
  if (params.page != null) query.page = params.page
  if (params.per_page != null) query.per_page = params.per_page
  if (params.search != null && String(params.search).trim()) {
    query.search = String(params.search).trim()
  }
  if (params.include_archived != null) {
    query.include_archived = Boolean(params.include_archived)
  }

  const { data } = await api.get('/surveys/managed', { params: query })
  return data
}


export async function getAvailableSurveys(params = {}) {
  const query = {}
  if (params.page != null) query.page = params.page
  if (params.per_page != null) query.per_page = params.per_page

  const { data } = await api.get('/surveys/available', { params: query })
  return data
}


export async function getSurveyForRespondent(surveyId) {
  const { data } = await api.get(`/surveys/${surveyId}`)
  return data
}


export async function getMySurveyResponse(surveyId) {
  const { data } = await api.get(`/surveys/${surveyId}/my-response`)
  return data
}


export async function startOrResumeSurveyResponse(surveyId) {
  const { data } = await api.post(`/surveys/${surveyId}/responses`)
  return data
}


export async function saveSurveyResponseAnswers(surveyId, responseId, answers) {
  const { data } = await api.patch(`/surveys/${surveyId}/responses/${responseId}`, { answers })
  return data
}


export async function submitSurveyResponse(surveyId, responseId) {
  const { data } = await api.post(`/surveys/${surveyId}/responses/${responseId}/submit`)
  return data
}


export async function getSurveyResponsesForManager(surveyId) {
  const { data } = await api.get(`/tests/${surveyId}/survey-responses`)
  return data
}


export async function getSurveyResponseForManager(surveyId, responseId) {
  const { data } = await api.get(`/tests/${surveyId}/survey-responses/${responseId}`)
  return data
}
