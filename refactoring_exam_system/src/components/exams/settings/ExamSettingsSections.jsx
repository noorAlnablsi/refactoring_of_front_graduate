import { ClipboardList, Lock, Navigation, Shuffle } from 'lucide-react'
import WizardSection from '../WizardSection'
import { SettingsRadio, SettingsSwitch } from './SettingsControls'

const inputClassName =
  'h-12 w-full rounded-xl border border-[#E5E9EB] bg-white px-4 text-center text-lg font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

export function ExamAttemptSettingsSection({ form, onFormChange }) {
  return (
    <WizardSection icon={ClipboardList} title="إعدادات المحاولة">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            الزمن المحدد (بالدقائق)
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
            عدد المحاولات المسموحة
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
  return (
    <WizardSection icon={Navigation} title="إعدادات التنقل">
      <div className="space-y-3">
        <div onClick={() => onSetNavigationMode(true)}>
          <SettingsRadio
            label="فرض التنقل المتسلسل"
            checked={cfg.force_sequential_navigation}
            onChange={() => onSetNavigationMode(true)}
          />
        </div>
        <div onClick={() => onSetNavigationMode(false)}>
          <SettingsRadio
            label="السماح بالعودة للأسئلة السابقة"
            checked={cfg.allow_back_navigation}
            onChange={() => onSetNavigationMode(false)}
          />
        </div>
      </div>
    </WizardSection>
  )
}

export function ExamAnswerRulesSection({ cfg, onSetAnswerRule }) {
  return (
    <WizardSection icon={Lock} title="قواعد الإجابة">
      <div className="space-y-3">
        <div onClick={() => onSetAnswerRule(true)}>
          <SettingsRadio
            label="إلزامية الإجابة على كل الأسئلة"
            checked={cfg.require_all_answers}
            onChange={() => onSetAnswerRule(true)}
          />
        </div>
        <div onClick={() => onSetAnswerRule(false)}>
          <SettingsRadio
            label="السماح بتخطي الأسئلة"
            checked={cfg.allow_skip_questions}
            onChange={() => onSetAnswerRule(false)}
          />
        </div>
      </div>
    </WizardSection>
  )
}

export function ExamDisplaySettingsSection({ cfg, onSetSetting }) {
  return (
    <WizardSection icon={Shuffle} title="عرض الأسئلة">
      <div className="divide-y divide-[#EEF2F4]">
        <SettingsSwitch
          label="ترتيب عشوائي للأسئلة"
          checked={cfg.shuffle_questions}
          onChange={(value) => onSetSetting('shuffle_questions', value)}
        />
        <SettingsSwitch
          label="ترتيب عشوائي للخيارات"
          checked={cfg.shuffle_choices}
          onChange={(value) => onSetSetting('shuffle_choices', value)}
        />
      </div>
    </WizardSection>
  )
}
