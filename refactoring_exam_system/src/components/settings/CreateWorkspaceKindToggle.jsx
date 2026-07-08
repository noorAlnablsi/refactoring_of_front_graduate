import { Building2, UserRound } from 'lucide-react'
import { WORKSPACE_KIND } from '../../constants/auth'

const OPTIONS = [
  {
    kind: WORKSPACE_KIND.INSTITUTION,
    title: 'منصة تعليمية',
    icon: Building2,
  },
  {
    kind: WORKSPACE_KIND.SOLO,
    title: 'معلم مستقل',
    icon: UserRound,
  },
]

function CreateWorkspaceKindToggle({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map(({ kind, title, icon: Icon }) => {
        const isActive = selected === kind

        return (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
              isActive
                ? 'border-[#2AA8A2] bg-[#E6F7F6] text-[#2AA8A2]'
                : 'border-[#E5E7EB] bg-[#F8FAFB] text-[#374151] hover:bg-[#F1F5F6]'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
            <span>{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CreateWorkspaceKindToggle
