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
    <div className="space-y-7">
      {options.map(({ id, title, icon: Icon }) => {
        const isActive = selected === id
        const isCreateSpace = id === WELCOME_SELECTION.CREATE_SPACE
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex h-[54px] w-full items-center justify-start gap-3 rounded-2xl bg-[#EEF2F3] px-5 text-sm font-bold transition md:w-[448px] ${
              isCreateSpace ? '-mt-3' : ''
            } ${
              isActive
                ? 'text-[#2AA8A2] ring-2 ring-[#2AA8A2]/35'
                : 'text-[#374151] hover:bg-[#E8ECEE]'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`} strokeWidth={2} />
            <span>{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export default WelcomeOptionSelector
