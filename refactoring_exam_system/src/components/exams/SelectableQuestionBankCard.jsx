import { CalendarDays, FileText } from 'lucide-react'
import {
  formatBankCardDate,
  formatBankQuestionsCount,
  getCommunityBankTheme,
} from '../../lib/questionBanks'

const cardShadow =
  'shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.04)]'

function SelectableQuestionBankCard({ bank, selected, onToggle, variant = 'owned' }) {
  const theme = variant === 'community' ? getCommunityBankTheme(bank) : null
  const badgeBg = theme?.badgeBg || '#E8F7F3'
  const badgeText = theme?.badgeText || '#0EA896'

  return (
    <button
      type="button"
      onClick={() => onToggle(bank.id)}
      className={`flex h-[324px] w-[255.67px] shrink-0 flex-col overflow-hidden rounded-xl bg-white text-right transition ${cardShadow} ${
        selected
          ? 'ring-2 ring-[#2AA8A2]'
          : 'ring-1 ring-[#E5E9EB] hover:ring-[#2AA8A2]/40'
      }`}
    >
      <div className="h-3 shrink-0 bg-gradient-to-r from-[#A7E3DA] to-[#22C1A3]" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="h-10 w-10 shrink-0" aria-hidden="true" />
          <span
            className="rounded-full bg-[#E8F7F3] px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: badgeBg, color: badgeText }}
          >
            {bank.subject_name || 'عام'}
          </span>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-center text-lg font-bold leading-8 text-[#111827]">
            {bank.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-center text-[13px] leading-6 text-[#6B7280]">
            {bank.description || 'لا يوجد وصف لهذا البنك بعد.'}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[#111827]">
            <FileText className="h-4 w-4 text-[#0EA896]" strokeWidth={2} />
            <span>{formatBankQuestionsCount(bank)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{formatBankCardDate(bank.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default SelectableQuestionBankCard
