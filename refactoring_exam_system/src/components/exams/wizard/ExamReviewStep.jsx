import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import ExamWizardFooter from '../ExamWizardFooter'
import { formatLocaleNumber } from '../../../lib/localeNumber'
import { getTestQuestionsCount, getTestTotalPoints } from '../../../lib/testDisplay'
import { getTestId, getTestName } from '../../../lib/testModel'
import { getSurveyAudienceI18nKey, getSurveyAudienceScope } from '../../../lib/surveys'
import ExamRandomGeneratedQuestionsPanel from '../ExamRandomGeneratedQuestionsPanel'

function ExamReviewStep({
  test,
  isSurvey = false,
  onNext,
  onBack,
  onSaveDraft,
  onRefresh,
  savingDraft = false,
}) {
  const { t } = useTranslation(['exams', 'surveys', 'common'])
  const questions = test?.questions || []
  const totalPoints = getTestTotalPoints(test)
  const displayQuestionsCount = getTestQuestionsCount(test)
  const testId = getTestId(test)
  const allowPointsEdit = !isSurvey && test?.auto_distribute_scores === false

  return (
    <div className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">
          {isSurvey ? t('wizard.review.eyebrow', { ns: 'surveys' }) : t('wizard.review.eyebrow')}
        </p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {isSurvey ? t('wizard.review.title', { ns: 'surveys' }) : t('wizard.review.title')}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          {isSurvey ? t('wizard.review.subtitle', { ns: 'surveys' }) : t('wizard.review.subtitle')}
        </p>
        {allowPointsEdit ? (
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[#2AA8A2]">
            {t('wizard.review.manualPointsHint')}
          </p>
        ) : null}
      </header>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="mb-5 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#2AA8A2]" />
          <h3 className="text-base font-extrabold text-[#2A3433]">{t('wizard.review.summaryTitle')}</h3>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">
              {isSurvey ? t('wizard.review.surveyName', { ns: 'surveys' }) : t('wizard.review.examName')}
            </dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{getTestName(test)}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">{t('wizard.review.questionsCount')}</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">
              {formatLocaleNumber(displayQuestionsCount ?? 0)}
            </dd>
          </div>
          {isSurvey ? (
            <div className="rounded-xl bg-[#F6F8F9] p-4">
              <dt className="text-xs text-[#94A3B8]">{t('wizard.review.audience', { ns: 'surveys' })}</dt>
              <dd className="mt-1 font-bold text-[#2AA8A2]">
                {t(getSurveyAudienceI18nKey(getSurveyAudienceScope(test)), { ns: 'surveys' })}
              </dd>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-[#F6F8F9] p-4">
                <dt className="text-xs text-[#94A3B8]">{t('wizard.review.totalPoints')}</dt>
                <dd className="mt-1 font-bold text-[#2AA8A2]">{formatLocaleNumber(totalPoints)}</dd>
              </div>
              <div className="rounded-xl bg-[#F6F8F9] p-4">
                <dt className="text-xs text-[#94A3B8]">{t('wizard.review.duration')}</dt>
                <dd className="mt-1 font-bold text-[#2A3433]">
                  {test?.duration_minutes
                    ? t('wizard.review.durationMinutes', { count: test.duration_minutes })
                    : '—'}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {questions.length > 0 ? (
        <ExamRandomGeneratedQuestionsPanel
          embedded
          testId={testId}
          questions={questions}
          allowPointsEdit={allowPointsEdit}
          hideGrading={isSurvey}
          surveyMode={isSurvey}
          sectionTitle={t('wizard.review.questionList')}
          continueLabel={t('wizard.review.nextPublish')}
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onContinue={onNext}
          savingDraft={savingDraft}
          onQuestionsChange={async () => {
            await onRefresh?.()
          }}
        />
      ) : (
        <ExamWizardFooter>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
            >
              <ArrowRight className="h-4 w-4" />
              {t('wizard.questions.review.back')}
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] disabled:opacity-50"
            >
              {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
            </button>
            <button
              type="button"
              data-keyboard-primary=""
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white"
            >
              {t('wizard.review.nextPublish')}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </ExamWizardFooter>
      )}
    </div>
  )
}

export default ExamReviewStep
