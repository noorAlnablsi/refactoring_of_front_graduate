import { Building2, UserRound } from 'lucide-react'
import { WORKSPACE_KIND } from '../../constants/auth'

function RoleSelector({ selected, onSelect }) {
  const roles = [
    {
      kind: WORKSPACE_KIND.SOLO,
      title: 'معلم مستقل',
      icon: UserRound,
    },
    {
      kind: WORKSPACE_KIND.INSTITUTION,
      title: 'مؤسسة تعليمية',
      icon: Building2,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map(({ kind, title, icon: Icon }) => {
        const isActive = selected === kind
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            className={`flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#EEF2F3] text-sm font-bold transition ${
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

export default RoleSelector
