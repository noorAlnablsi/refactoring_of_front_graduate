import { getVisibilityLabel } from '../../lib/questionBanks'

const toneByVisibility = {
  PRIVATE: 'bg-[#F1F5F9] text-[#475569]',
  WORKSPACE: 'bg-[#E8F7F6] text-[#2AA8A2]',
  COMMUNITY: 'bg-[#EEF2FF] text-[#4F46E5]',
}

function VisibilityBadge({ value }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-bold ${toneByVisibility[value] || 'bg-[#F1F5F9] text-[#475569]'}`}
    >
      {getVisibilityLabel(value)}
    </span>
  )
}

export default VisibilityBadge
