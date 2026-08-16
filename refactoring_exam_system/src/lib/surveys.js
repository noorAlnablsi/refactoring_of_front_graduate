import { SURVEY_AUDIENCE_SCOPE, TEST_AVAILABILITY_TIME_MODE, TEST_KIND } from '../constants/tests'
import { ROUTES } from '../constants/routes'
import { getTestId } from './testModel'

export function isSurveyTest(test) {
  return String(test?.availability_time_mode || '').toUpperCase() === TEST_AVAILABILITY_TIME_MODE.SURVEY
}

export function getTestKind(test, fallback = TEST_KIND.EXAM) {
  if (isSurveyTest(test)) return TEST_KIND.SURVEY
  return fallback
}

export function getSurveyAudienceScope(test) {
  const scope = String(test?.audience_scope || '').toUpperCase()
  if (Object.values(SURVEY_AUDIENCE_SCOPE).includes(scope)) return scope
  return SURVEY_AUDIENCE_SCOPE.WORKSPACE
}

export function getSurveyShareLink(test) {
  if (test?.share_url) return test.share_url
  if (test?.public_url) return test.public_url

  const surveyId = getTestId(test)
  if (surveyId == null || surveyId === '') {
    return `${window.location.origin}${ROUTES.SURVEYS}`
  }

  return `${window.location.origin}${ROUTES.SURVEY_RESPOND.replace(':id', String(surveyId))}`
}

export function getSurveyWizardEditPath(testId) {
  return ROUTES.SURVEY_EDIT.replace(':id', String(testId))
}

export function getSurveyAudienceI18nKey(scope) {
  const normalized = String(scope || '').toUpperCase()
  if (normalized === SURVEY_AUDIENCE_SCOPE.COMMUNITY) return 'audience.community'
  if (normalized === SURVEY_AUDIENCE_SCOPE.TARGETED) return 'audience.targeted'
  return 'audience.workspace'
}

export function isActiveWorkspaceMember(member) {
  const status = String(member?.status || member?.membership_status || 'ACTIVE').toUpperCase()
  return status === 'ACTIVE'
}
