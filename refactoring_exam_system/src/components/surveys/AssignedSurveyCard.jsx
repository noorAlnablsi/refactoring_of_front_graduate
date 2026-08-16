import { ArrowRight, ClipboardList, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { getSurveyAudienceScope } from '../../lib/surveys'
import { getTestId, getTestName } from '../../lib/testModel'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellDividerClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import ExamStatusBadge from '../exams/ExamStatusBadge'

function AssignedSurveyCard({ survey }) {
  const { t } = useTranslation('surveys')
  const navigate = useNavigate()
  const surveyId = getTestId(survey)
  const audience = getSurveyAudienceScope(survey)

  return (
    <article className={`flex h-full flex-col p-5 ${shellCardInteractiveClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-lg ${shellPageTitleClass}`}>
            {getTestName(survey) || t('card.untitled')}
          </h3>
          {survey.description ? (
            <p className={`mt-2 line-clamp-2 text-sm leading-6 ${shellBodyTextClass}`}>
              {survey.description}
            </p>
          ) : null}
        </div>
        {survey.status ? <ExamStatusBadge status={survey.status} /> : null}
      </div>

      <div className={`mt-4 flex flex-wrap gap-4 text-xs font-semibold ${shellSubtleTextClass}`}>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {t(`audience.${audience.toLowerCase()}`)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" />
          {t('assigned.openSurvey')}
        </span>
      </div>

      <div className={`mt-auto border-t pt-4 ${shellDividerClass}`}>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SURVEY_RESPOND.replace(':id', String(surveyId)))}
          className={`w-full justify-center ${shellAccentButtonClass}`}
        >
          {t('assigned.openCta')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}

export default AssignedSurveyCard
