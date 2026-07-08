import { ArrowRight } from 'lucide-react'
import { Navigate } from 'react-router-dom'
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
import { TEST_WIZARD_STEPS } from '../../constants/tests'
import { useExamWizard } from '../../hooks/tests/useExamWizard'
import { canCreateExam, canAccessExams } from '../../lib/workspaceContext'
import { getTestName } from '../../lib/testModel'
import {
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function ExamWizardPage({ isNew = false }) {
  const wizard = useExamWizard({ isNew })

  if (!canAccessExams() || !canCreateExam()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (isNew) {
    return (
      <div className="space-y-6">
        <WizardHeader onBack={wizard.exitToExams} title="إنشاء امتحان جديد" />
        <ExamWizardStepper currentStep={TEST_WIZARD_STEPS.INFO} />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <ExamBasicInfoStep
            onSubmit={wizard.handleCreate}
            onSaveDraft={wizard.handleSaveDraft}
            onDraftChange={wizard.setDraft}
            submitting={wizard.submitting}
            savingDraft={wizard.savingDraft}
          />
          <ExamSummarySidebar test={null} draft={wizard.draft} currentStep={TEST_WIZARD_STEPS.INFO} />
        </div>
      </div>
    )
  }

  if (wizard.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[#94A3B8]">جاري تحميل الامتحان...</p>
      </div>
    )
  }

  if (!wizard.test) {
    return <Navigate to={ROUTES.EXAMS} replace />
  }

  const { test, currentStep, blueprintActive } = wizard

  return (
    <div className="space-y-6">
      {!blueprintActive ? (
        <>
          <WizardHeader
            onBack={wizard.exitToExams}
            title={getTestName(test) || 'تحرير الامتحان'}
          />
          <ExamWizardStepper currentStep={currentStep} />
        </>
      ) : null}

      <div className={`grid gap-6 ${blueprintActive ? '' : 'lg:grid-cols-[1fr_300px]'}`}>
        <div>
          {currentStep === TEST_WIZARD_STEPS.INFO ? (
            <ExamBasicInfoStep
              initialValues={wizard.initialInfo}
              onSubmit={wizard.handleUpdateInfo}
              onSaveDraft={wizard.handleSaveDraft}
              submitting={wizard.submitting}
              savingDraft={wizard.savingDraft}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.QUESTIONS ? (
            <ExamAddQuestionsStep
              test={test}
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
              onNext={() => wizard.goToStep(TEST_WIZARD_STEPS.PUBLISH)}
              onBack={() => wizard.goToStep(TEST_WIZARD_STEPS.SETTINGS)}
              savingDraft={wizard.savingDraft}
              onSaveDraft={() => wizard.handleSaveWizardDraftProgress(TEST_WIZARD_STEPS.REVIEW)}
            />
          ) : null}

          {currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishStep
              test={test}
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
            <ExamSettingsSummarySidebar test={test} settings={wizard.settingsSidebarConfig} />
          ) : currentStep === TEST_WIZARD_STEPS.PUBLISH ? (
            <ExamPublishSummarySidebar test={test} settings={wizard.settingsSidebarConfig} />
          ) : (
            <ExamSummarySidebar test={test} currentStep={currentStep} />
          )
        ) : null}
      </div>
    </div>
  )
}

function WizardHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-[var(--shell-text-muted)] ${shellCardClass}`}
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      <div>
        <p className={shellPageEyebrowClass}>معالج إنشاء الامتحان</p>
        <h1 className={`text-2xl ${shellPageTitleClass}`}>{title}</h1>
      </div>
    </div>
  )
}

export function ExamCreatePage() {
  return <ExamWizardPage isNew />
}

export default ExamWizardPage
