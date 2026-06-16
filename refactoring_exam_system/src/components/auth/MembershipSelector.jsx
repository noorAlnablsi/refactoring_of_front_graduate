import { GraduationCap, UserRound } from 'lucide-react'
import { getMembershipLabel } from '../../lib/membershipLabel'

function MembershipSelector({ memberships, selectedId, onSelect }) {
  return (
    <div className="space-y-3">
      {memberships.map((membership) => {
        const isActive = selectedId === membership.membership_id
        const Icon = membership.role === 'STUDENT' ? GraduationCap : UserRound

        return (
          <button
            key={membership.membership_id}
            type="button"
            onClick={() => onSelect(membership.membership_id)}
            className={`flex h-14 w-full items-center justify-start gap-3 rounded-2xl px-5 text-sm font-bold transition md:w-[448px] ${
              isActive
                ? 'bg-[#E8F7F6] text-[#2AA8A2] ring-2 ring-[#2AA8A2]/35'
                : 'bg-[#EEF2F3] text-[#374151] hover:bg-[#E8ECEE]'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`} strokeWidth={2} />
            <span className="text-right">{getMembershipLabel(membership)}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MembershipSelector
