import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { TEST_AVAILABILITY_TIME_MODE } from '../../../constants/tests'
import { showAppToast } from '../../../lib/appToast'
import {
  buildTestSettingsFormState,
  buildTestSettingsPayload,
  getDefaultSeverityPolicy,
} from '../../../lib/testSettings'
import ExamWizardFooter from '../ExamWizardFooter'
import {
  ExamAnswerRulesSection,
  ExamAttemptSettingsSection,
  ExamAvailabilitySettingsSection,
  ExamDisplaySettingsSection,
  ExamNavigationSettingsSection,
} from '../settings/ExamSettingsSections'
import { ExamProctoringSettingsSection } from '../settings/ExamProctoringSettingsSection'

function ExamSettingsStep({
  test,
  onSubmit,
  submitting,
  savingDraft = false,
  onBack,
  onSaveDraft,
  onFormChange,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const [form, setForm] = useState(() => buildTestSettingsFormState(test))

  useEffect(() => {
    const next = buildTestSettingsFormState(test)
    setForm(next)
  }, [test])

  useEffect(() => {
    onFormChange?.(form.settings_config)
  }, [form.settings_config, onFormChange])

  const setSetting = (key, value) => {
    setForm((prev) => ({
      ...prev,
      settings_config: { ...prev.settings_config, [key]: value },
    }))
  }

  const setNavigationMode = (sequential) => {
    setForm((prev) => ({
      ...prev,
      settings_config: {
        ...prev.settings_config,
        force_sequential_navigation: sequential,
        allow_back_navigation: !sequential,
      },
    }))
  }

  const setAnswerRule = (requireAll) => {
    setForm((prev) => ({
      ...prev,
      settings_config: {
        ...prev.settings_config,
        require_all_answers: requireAll,
        allow_skip_questions: !requireAll,
      },
    }))
  }

  const validateAvailability = () => {
    if (form.availability_time_mode !== TEST_AVAILABILITY_TIME_MODE.SCHEDULED) return true
    if (form.starts_at) return true
    showAppToast('validation.startsAtRequired', 'error', { ns: 'exams' })
    return false
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validateAvailability()) return
    onSubmit(buildTestSettingsPayload(form))
  }

  const handleSaveDraftClick = () => {
    if (!validateAvailability()) return
    onSaveDraft?.(buildTestSettingsPayload(form))
  }

  const cfg = form.settings_config
  const severity = cfg.severity_policy || getDefaultSeverityPolicy()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.settings.eyebrow')}</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {t('wizard.settings.title')}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">{t('wizard.settings.subtitle')}</p>
      </header>

      <ExamAvailabilitySettingsSection form={form} onFormChange={setForm} />
      <ExamAttemptSettingsSection form={form} onFormChange={setForm} />
      <ExamNavigationSettingsSection cfg={cfg} onSetNavigationMode={setNavigationMode} />
      <ExamAnswerRulesSection cfg={cfg} onSetAnswerRule={setAnswerRule} />
      <ExamDisplaySettingsSection cfg={cfg} onSetSetting={setSetting} />
      <ExamProctoringSettingsSection cfg={cfg} severity={severity} onSetSetting={setSetting} />

      <ExamWizardFooter className="-mx-1 mt-2">
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
            onClick={handleSaveDraftClick}
            disabled={savingDraft}
            className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
          >
            {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-60"
          >
            {submitting ? t('common:loading.saving') : t('wizard.settings.continueToReview')}
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </ExamWizardFooter>
    </form>
  )
}

export default ExamSettingsStep
