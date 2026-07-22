import { CalendarClock, ClipboardList, Clock3, Lock, Navigation, Shuffle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TEST_AVAILABILITY_TIME_MODE } from '../../../constants/tests'
import {
  clampEntryWindowMinutes,
  fromDatetimeLocalValue,
  getMaxEntryWindowMinutes,
  toDatetimeLocalValue,
} from '../../../lib/testSettings'
import WizardSection from '../WizardSection'
import { SettingsRadio, SettingsSwitch } from './SettingsControls'

const inputClassName =
  'h-12 w-full rounded-xl border border-[#E5E9EB] bg-white px-4 text-center text-lg font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

function AvailabilityModeCard({ selected, icon: Icon, title, description, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-right transition ${
        selected
          ? 'border-[#2AA8A2] shadow-[0_8px_20px_rgba(42,168,162,0.12)] ring-1 ring-[#2AA8A2]/30'
          : 'border-[#E5E9EB] hover:border-[#CBD5E1]'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-[#2AA8A2]' : 'border-[#CBD5E1]'
        }`}
      >
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#2AA8A2]" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <Icon className={`h-4 w-4 shrink-0 ${selected ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`} />
          <span className="text-sm font-extrabold text-[#2A3433]">{title}</span>
        </span>
        <span className="mt-2 block text-xs leading-6 text-[#94A3B8]">{description}</span>
      </span>
    </button>
  )
}

export function ExamAvailabilitySettingsSection({ form, onFormChange }) {
  const { t } = useTranslation('exams')
  const isScheduled = form.availability_time_mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED
  const maxEntry = getMaxEntryWindowMinutes(form.duration_minutes)

  const setMode = (mode) => {
    onFormChange((prev) => {
      if (mode === TEST_AVAILABILITY_TIME_MODE.FLEXIBLE) {
        return {
          ...prev,
          availability_time_mode: TEST_AVAILABILITY_TIME_MODE.FLEXIBLE,
          starts_at: null,
          entry_window_minutes: null,
        }
      }
      const duration = prev.duration_minutes
      const defaultEntry = getMaxEntryWindowMinutes(duration)
      return {
        ...prev,
        availability_time_mode: TEST_AVAILABILITY_TIME_MODE.SCHEDULED,
        starts_at: prev.starts_at || null,
        entry_window_minutes: clampEntryWindowMinutes(
          prev.entry_window_minutes ?? defaultEntry,
          duration,
        ),
      }
    })
  }

  return (
    <WizardSection icon={CalendarClock} title={t('settings.availability.title')}>
      <div className="grid gap-3 md:grid-cols-2">
        <AvailabilityModeCard
          selected={!isScheduled}
          icon={Clock3}
          title={t('settings.availability.flexibleTitle')}
          description={t('settings.availability.flexibleDesc')}
          onSelect={() => setMode(TEST_AVAILABILITY_TIME_MODE.FLEXIBLE)}
        />
        <AvailabilityModeCard
          selected={isScheduled}
          icon={CalendarClock}
          title={t('settings.availability.scheduledTitle')}
          description={t('settings.availability.scheduledDesc')}
          onSelect={() => setMode(TEST_AVAILABILITY_TIME_MODE.SCHEDULED)}
        />
      </div>

      {isScheduled ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">
              {t('settings.availability.startsAt')}
            </label>
            <input
              type="datetime-local"
              value={toDatetimeLocalValue(form.starts_at)}
              onChange={(event) =>
                onFormChange((prev) => ({
                  ...prev,
                  starts_at: fromDatetimeLocalValue(event.target.value),
                }))
              }
              className={`${inputClassName} text-sm font-bold`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">
              {t('settings.availability.entryWindow')}
            </label>
            <input
              type="number"
              min={1}
              max={maxEntry}
              value={form.entry_window_minutes ?? maxEntry}
              onChange={(event) =>
                onFormChange((prev) => ({
                  ...prev,
                  entry_window_minutes: clampEntryWindowMinutes(
                    event.target.value,
                    prev.duration_minutes,
                  ),
                }))
              }
              className={inputClassName}
            />
            <p className="mt-2 text-xs leading-6 text-[#94A3B8]">
              {t('settings.availability.entryWindowHint', { max: maxEntry })}
            </p>
          </div>
        </div>
      ) : null}
    </WizardSection>
  )
}

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
              onFormChange((prev) => {
                const duration_minutes = event.target.value
                if (prev.availability_time_mode !== TEST_AVAILABILITY_TIME_MODE.SCHEDULED) {
                  return { ...prev, duration_minutes }
                }
                return {
                  ...prev,
                  duration_minutes,
                  entry_window_minutes: clampEntryWindowMinutes(
                    prev.entry_window_minutes ?? getMaxEntryWindowMinutes(duration_minutes),
                    duration_minutes,
                  ),
                }
              })
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
