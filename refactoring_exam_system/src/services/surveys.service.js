import api from '../lib/axios'

/** GET /surveys/managed — surveys the actor can manage in the active workspace. */
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

/**
 * GET /surveys/available — surveys the user can answer (respondent list).
 * Auth: Bearer only. Do not send `search` (HTTP route does not accept it yet).
 */
export async function getAvailableSurveys(params = {}) {
  const query = {}
  if (params.page != null) query.page = params.page
  if (params.per_page != null) query.per_page = params.per_page

  const { data } = await api.get('/surveys/available', { params: query })
  return data
}

/** GET /surveys/{surveyId} — survey + questions + my_response for respondent. */
export async function getSurveyForRespondent(surveyId) {
  const { data } = await api.get(`/surveys/${surveyId}`)
  return data
}

/** GET /surveys/{surveyId}/my-response — response status only. */
export async function getMySurveyResponse(surveyId) {
  const { data } = await api.get(`/surveys/${surveyId}/my-response`)
  return data
}

/** POST /surveys/{surveyId}/responses — start or resume (no body). */
export async function startOrResumeSurveyResponse(surveyId) {
  const { data } = await api.post(`/surveys/${surveyId}/responses`)
  return data
}

/** PATCH /surveys/{surveyId}/responses/{responseId} — save answers. */
export async function saveSurveyResponseAnswers(surveyId, responseId, answers) {
  const { data } = await api.patch(`/surveys/${surveyId}/responses/${responseId}`, { answers })
  return data
}

/** POST /surveys/{surveyId}/responses/{responseId}/submit — submit (no body). */
export async function submitSurveyResponse(surveyId, responseId) {
  const { data } = await api.post(`/surveys/${surveyId}/responses/${responseId}/submit`)
  return data
}

/**
 * GET /tests/{surveyId}/survey-responses — manager summary (no answer payloads).
 * Auth: Bearer + X-Workspace-Id.
 */
export async function getSurveyResponsesForManager(surveyId) {
  const { data } = await api.get(`/tests/${surveyId}/survey-responses`)
  return data
}
