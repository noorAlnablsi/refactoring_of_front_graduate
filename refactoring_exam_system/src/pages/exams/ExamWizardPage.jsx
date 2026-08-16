import { ArrowRight } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ExamSummarySidebar from '../../components/exams/ExamSummarySidebar'
import ExamPublishSummarySidebar from '../../components/exams/ExamPublishSummarySidebar'
import ExamSettingsSummarySidebar from '../../components/exams/ExamSettingsSummarySidebar'
import ExamWizardStepper from '../../components/exams/ExamWizardStepper'
import ExamAddQuestionsStep from '../../components/exams/wizard/ExamAddQuestionsStep'
import ExamBasicInfoStep from '../../components/exams/wizard/ExamBasicInfoStep'
import ExamPublishStep from '../../components/exams/wizard/ExamPublishStep'
import ExamReviewStep from '../../components/exams/wizard/ExamReviewStep'
import ExamSettingsStep from '../../components/exams/wizard/ExamSettingsStep'
import { ROUTES } from '../../constants/routes'
import { TEST_KIND, TEST_WIZARD_STEPS } from '../../constants/tests'
import { useExamWizard } from '../../hooks/tests/useExamWizard'
import { canCreateExam, canAccessExams } from '../../lib/workspaceContext'
import { isSurveyTest, getSurveyWizardEditPath } from '../../lib/surveys'
import { getTestId, getTestName } from '../../lib/testModel'
import {
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function ExamWizardPage({ isNew = false, kind = TEST_KIND.EXAM }) {
  const { t } = useTranslation(['exams', 'surveys'])
  const wizard = useExamWizard({ isNew, kind })
  const isSurvey = wizard.isSurvey || kind === TEST_KIND.SURVEY

  if (!canAccessExams() || !canCreateExam()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (isNew) {
    return (
      <div className="min-w-0 space-y-6">
        <WizardHeader
          onBack={wizard.exitToExams}
          title={isSurvey ? t('wizard.createTitle', { ns: 'surveys' }) : t('wizard.createTitle')}
          eyebrow={isSurvey ? t('wizard.header.eyebrow', { ns: 'surveys' }) : t('wizard.header.eyebrow')}
        />
        <ExamWizardStepper currentStep={TEST_WIZARD_STEPS.INFO} />
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <ExamBasicInfoStep
              kind={kind}
              onSubmit={wizard.handleCreate}
              onSaveDraft={wizard.handleSaveDraft}
              onDraftChange={wizard.setDraft}
              submitting={wizard.submitting}
              savingDraft={wizard.savingDraft}
            />
          </div>
          <ExamSummarySidebar
            test={null}
            draft={wizard.draft}
            currentStep={TEST_WIZARD_STEPS.INFO}
            isSurvey={isSurvey}
          />
        </div>
      </div>
    )
  }

  if (wizard.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[#94A3B8]">
          {isSurvey ? t('wizard.loading', { ns: 'surveys' }) : t('wizard.loadingExam')}
        </p>
      </div>
    )
  }

  if (!wizard.test) {
    return <Navigate to={isSurvey ? ROUTES.SURVEYS : ROUTES.EXAMS} replace />
  }

  if (!isNew && wizard.test && isSurveyTest(wizard.test) && kind !== TEST_KIND.SURVEY) {
    return (
      <Navigate
        to={`${getSurveyWizardEditPath(getTestId(wizard.test))}${window.location.search}`}
        replace
      />
    )
  }

  if (!isNew && wizard.test && !isSurveyTest(wizard.test) && kind === TEST_KIND.SURVEY) {
    return (
      <Navigate
        to={`${ROUTES.EXAM_EDIT.replace(':id', getTestId(wizard.test))}${window.location.search}`}
        replace
      />
    )
  }

  const { test, currentStep, blueprintActive } = wizard

  return (
    <div className="min-w-0 space-y-6">
      {!blueprintActive ? (
        <>
          <WizardHeader
            onBack={wizard.exitToExams}
            title={getTestName(test) || (isSurvey ? t('wizard.editTitle', { ns: 'surveys' }) : t('wizard.editTitle'))}
            eyebrow={isSurvey ? t('wizard.header.eyebrow', { ns: 'surveys' }) : t('wizard.header.eyebrow')}
          />
          <ExamWizardStepper currentStep={currentStep} />
        </>
      ) : null}

      <div className={`grid min-w-0 gap-6 ${blueprintActive ? '' : 'lg:grid-cols-[minmax(0,1fr)_300px]'}`}>
        <div className="min-w-0">
          {currentStep === TEST_WIZARD_STEPS.INFO ? (
            <ExamBasicInfoStep
              kind={isSurvey ? TEST_KIND.SURVEY : TEST_KIND.EXAM}
              initialValues={wizard.initialInfo}
              onSubmit={wizard.handleUpdateInfo}
              onSaveDraft={wizard.handleSaveDraft}
              submitting={wizard.submitting}
              savingDraft={wizard.savingDraft}
              autoDistributeLocked
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.QUESTIONS ? (
            <ExamAddQuestionsStep
              test={test}
              surveyMode={isSurvey}
              onRefresh={() => wizard.loadTest(true)}
              onNext={wizard.handleQuestionsNext}
              onBack={() => wizard.goToStep(TEST_WIZARD_STEPS.INFO)}
              onBlueprintActiveChange={wizard.setBlueprintActive}
              onSaveDraftProgress={wizard.handleSaveQuestionsDraftProgress}
              savingDraft={wizard.savingDraft}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.SETTINGS ? (
            <ExamSettingsStep
              test={test}
              isSurvey={isSurvey}
              onSubmit={wizard.handleUpdateSettings}
              submitting={wizard.submitting}
              savingDraft={wizard.savingDraft}
              onBack={() => wizard.goToStep(TEST_WIZARD_STEPS.QUESTIONS)}
              onSaveDraft={wizard.handleSaveSettingsDraft}
              onFormChange={wizard.setSettingsPreview}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.REVIEW ? (
            <ExamReviewStep
              test={test}
              isSurvey={isSurvey}
              onNext={() => wizard.goToStep(TEST_WIZARD_STEPS.PUBLISH)}
              onBack={() => wizard.goToStep(TEST_WIZARD_STEPS.SETTINGS)}
              savingDraft={wizard.savingDraft}
              onSaveDraft={() => wizard.handleSaveWizardDraftProgress(TEST_WIZARD_STEPS.REVIEW)}
              onRefresh={() => wizard.loadTest(true)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishStep
              test={test}
              isSurvey={isSurvey}
              publishing={wizard.publishing}
              savingDraft={wizard.savingDraft}
              onPublishNow={wizard.handlePublishNow}
              onSchedule={wizard.handleSchedule}
              onBack={() => wizard.goToStep(TEST_WIZARD_STEPS.REVIEW)}
              onSaveDraft={() => wizard.handleSaveWizardDraftProgress(TEST_WIZARD_STEPS.PUBLISH)}
            />
          ) : null}
        </div>

        {!blueprintActive ? (
          currentStep === TEST_WIZARD_STEPS.SETTINGS ? (
            <ExamSettingsSummarySidebar test={test} settings={wizard.settingsSidebarConfig} isSurvey={isSurvey} />
          ) : currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishSummarySidebar test={test} settings={wizard.settingsSidebarConfig} isSurvey={isSurvey} />
          ) : (
            <ExamSummarySidebar test={test} currentStep={currentStep} isSurvey={isSurvey} />
          )
        ) : null}
      </div>
    </div>
  )
}

function WizardHeader({ title, onBack, eyebrow }) {
  const { t } = useTranslation('exams')

  return (
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--shell-text-muted)] ${shellCardClass}`}
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <p className={shellPageEyebrowClass}>{eyebrow || t('wizard.header.eyebrow')}</p>
        <h1 className={`truncate text-2xl ${shellPageTitleClass}`}>{title}</h1>
      </div>
    </div>
  )
}

export function ExamCreatePage() {
  return <ExamWizardPage isNew kind={TEST_KIND.EXAM} />
}

export function SurveyCreatePage() {
  return <ExamWizardPage isNew kind={TEST_KIND.SURVEY} />
}

export function SurveyEditPage() {
  return <ExamWizardPage kind={TEST_KIND.SURVEY} />
}

export default ExamWizardPage
