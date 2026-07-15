import { ClipboardList, Lock, Navigation, Shuffle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import WizardSection from '../WizardSection'
import { SettingsRadio, SettingsSwitch } from './SettingsControls'

const inputClassName =
  'h-12 w-full rounded-xl border border-[#E5E9EB] bg-white px-4 text-center text-lg font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

export function ExamAttemptSettingsSection({ form, onFormChange }) {
  const { t } = useTranslation('exams')

  return (
    <WizardSection icon={ClipboardList} title={t('settings.sections.attempt')}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('settings.sections.durationMinutes')}
          </label>
          <input
            type="number"
            min={1}
            value={form.duration_minutes}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, duration_minutes: event.target.value }))
            }
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('settings.sections.maxAttempts')}
          </label>
          <input
            type="number"
            min={1}
            value={form.max_attempts}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, max_attempts: event.target.value }))
            }
            className={inputClassName}
          />
        </div>
      </div>
    </WizardSection>
  )
}

export function ExamNavigationSettingsSection({ cfg, onSetNavigationMode }) {
  const { t } = useTranslation('exams')

  return (
    <WizardSection icon={Navigation} title={t('settings.sections.navigation')}>
      <div className="space-y-3">
        <div onClick={() => onSetNavigationMode(true)}>
          <SettingsRadio
            label={t('settings.sections.forceSequential')}
            checked={cfg.force_sequential_navigation}
            onChange={() => onSetNavigationMode(true)}
          />
        </div>
        <div onClick={() => onSetNavigationMode(false)}>
          <SettingsRadio
            label={t('settings.sections.allowBack')}
            checked={cfg.allow_back_navigation}
            onChange={() => onSetNavigationMode(false)}
          />
        </div>
      </div>
    </WizardSection>
  )
}

export function ExamAnswerRulesSection({ cfg, onSetAnswerRule }) {
  const { t } = useTranslation('exams')

  return (
    <WizardSection icon={Lock} title={t('settings.sections.answerRules')}>
      <div className="space-y-3">
        <div onClick={() => onSetAnswerRule(true)}>
          <SettingsRadio
            label={t('settings.sections.requireAll')}
            checked={cfg.require_all_answers}
            onChange={() => onSetAnswerRule(true)}
          />
        </div>
        <div onClick={() => onSetAnswerRule(false)}>
          <SettingsRadio
            label={t('settings.sections.allowSkip')}
            checked={cfg.allow_skip_questions}
            onChange={() => onSetAnswerRule(false)}
          />
        </div>
      </div>
    </WizardSection>
  )
}

export function ExamDisplaySettingsSection({ cfg, onSetSetting }) {
  const { t } = useTranslation('exams')

  return (
    <WizardSection icon={Shuffle} title={t('settings.sections.display')}>
      <div className="divide-y divide-[#EEF2F4]">
        <SettingsSwitch
          label={t('settings.sections.shuffleQuestions')}
          checked={cfg.shuffle_questions}
          onChange={(value) => onSetSetting('shuffle_questions', value)}
        />
        <SettingsSwitch
          label={t('settings.sections.shuffleChoices')}
          checked={cfg.shuffle_choices}
          onChange={(value) => onSetSetting('shuffle_choices', value)}
        />
      </div>
    </WizardSection>
  )
}
