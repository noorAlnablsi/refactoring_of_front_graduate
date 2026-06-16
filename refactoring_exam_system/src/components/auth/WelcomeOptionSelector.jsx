import { Building2, GraduationCap } from 'lucide-react'
import { WELCOME_SELECTION } from '../../constants/auth'

function WelcomeOptionSelector({ selected, onSelect }) {
  const options = [
    {
      id: WELCOME_SELECTION.CREATE_SPACE,
      title: 'إنشاء مساحة تعليمية',
      icon: Building2,
    },
    {
      id: WELCOME_SELECTION.JOIN_STUDENT,
      title: 'الانضمام كطالب',
      icon: GraduationCap,
    },
  ]

  return (
    <div className="space-y-3">
      {options.map(({ id, title, icon: Icon }) => {
        const isActive = selected === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex h-14 w-full items-center justify-start gap-3 rounded-2xl bg-[#EEF2F3] px-5 text-sm font-bold transition md:w-[448px] ${
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
