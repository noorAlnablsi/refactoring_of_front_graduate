import { useTranslation } from 'react-i18next'
import { Building2, GraduationCap } from 'lucide-react'
import { WELCOME_SELECTION } from '../../constants/auth'

function WelcomeOptionSelector({ selected, onSelect }) {
  const { t } = useTranslation('auth')
  const options = [
    {
      id: WELCOME_SELECTION.CREATE_SPACE,
      title: t('welcome.createSpace'),
      icon: Building2,
    },
    {
      id: WELCOME_SELECTION.JOIN_STUDENT,
      title: t('welcome.joinAsStudent'),
      icon: GraduationCap,
    },
  ]

  return (
    <div className="space-y-7" data-keyboard-option-group="welcome">
      {options.map(({ id, title, icon: Icon }) => {
        const isActive = selected === id
        return (
          <button
            key={id}
            type="button"
            data-keyboard-option=""
            aria-pressed={isActive}
            onClick={() => onSelect(id)}
            className={`flex h-[54px] w-full max-w-[448px] items-center justify-start gap-3 rounded-2xl bg-[#EEF2F3] px-5 text-sm font-bold transition ${
              isActive
                ? 'text-[#2AA8A2] ring-2 ring-[#2AA8A2]/35'
                : 'text-[#374151] hover:bg-[#E8ECEE]'
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`} strokeWidth={2} />
            <span className="min-w-0 truncate">{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export default WelcomeOptionSelector
