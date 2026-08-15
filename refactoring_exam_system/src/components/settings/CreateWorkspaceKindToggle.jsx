import { useTranslation } from 'react-i18next'
import { Building2, UserRound } from 'lucide-react'
import { WORKSPACE_KIND } from '../../constants/auth'

function CreateWorkspaceKindToggle({ selected, onSelect }) {
  const { t } = useTranslation('settings')
  const options = [
    {
      kind: WORKSPACE_KIND.INSTITUTION,
      title: t('createWorkspace.institutionPlatform'),
      icon: Building2,
    },
    {
      kind: WORKSPACE_KIND.SOLO,
      title: t('createWorkspace.soloTeacher'),
      icon: UserRound,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map(({ kind, title, icon: Icon }) => {
        const isActive = selected === kind

        return (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            className={`flex h-auto min-h-12 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-sm font-bold transition ${
              isActive
                ? 'border-[#2AA8A2] bg-[#E6F7F6] text-[#2AA8A2]'
                : 'border-[#E5E7EB] bg-[#F8FAFB] text-[#374151] hover:bg-[#F1F5F6]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="min-w-0 text-center leading-snug">{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CreateWorkspaceKindToggle
