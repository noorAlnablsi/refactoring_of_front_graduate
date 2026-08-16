import { Building2, Globe, UserRoundCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SURVEY_AUDIENCE_SCOPE } from '../../constants/tests'
import WizardSection from '../exams/WizardSection'

const AUDIENCE_OPTIONS = [
  {
    value: SURVEY_AUDIENCE_SCOPE.COMMUNITY,
    icon: Globe,
    titleKey: 'audience.community',
    descriptionKey: 'audience.communityDesc',
  },
  {
    value: SURVEY_AUDIENCE_SCOPE.WORKSPACE,
    icon: Building2,
    titleKey: 'audience.workspace',
    descriptionKey: 'audience.workspaceDesc',
  },
  {
    value: SURVEY_AUDIENCE_SCOPE.TARGETED,
    icon: UserRoundCheck,
    titleKey: 'audience.targeted',
    descriptionKey: 'audience.targetedDesc',
  },
]

function AudienceCard({ selected, icon: Icon, title, description, onSelect, disabled }) {
  return (
    <button
      type="button"
      data-keyboard-option=""
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-right transition ${
        selected
          ? 'border-[#2AA8A2] shadow-[0_8px_20px_rgba(42,168,162,0.12)] ring-1 ring-[#2AA8A2]/30'
          : 'border-[#E5E9EB] hover:border-[#CBD5E1]'
      } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
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

function SurveyAudienceSection({ value, onChange, locked = false }) {
  const { t } = useTranslation('surveys')

  return (
    <WizardSection icon={Globe} title={t('audience.title')}>
      <p className="mb-4 text-sm leading-7 text-[#64748B]">{t('audience.subtitle')}</p>
      <div className="grid gap-3 md:grid-cols-3" data-keyboard-option-group="survey-audience">
        {AUDIENCE_OPTIONS.map((option) => (
          <AudienceCard
            key={option.value}
            selected={value === option.value}
            disabled={locked}
            icon={option.icon}
            title={t(option.titleKey)}
            description={t(option.descriptionKey)}
            onSelect={() => onChange?.(option.value)}
          />
        ))}
      </div>
      {locked ? (
        <p className="mt-3 text-xs leading-6 text-[#94A3B8]">{t('audience.lockedHint')}</p>
      ) : null}
    </WizardSection>
  )
}

export default SurveyAudienceSection
