import { FileText, RotateCcw } from 'lucide-react'
import {
  formatBankQuestionsCount,
  formatBankUsageCount,
  formatCommunityQuestionsCount,
} from '../../lib/questionBanks'

/**
 * Equal-weight stats strip for question-bank cards.
 * Keeps questions + usage aligned and scannable without corner stretch.
 */
function BankCardStatsBar({ bank, accentColor = '#0EA896', questionsVariant = 'owned' }) {
  const questionsLabel =
    questionsVariant === 'community'
      ? formatCommunityQuestionsCount(bank)
      : formatBankQuestionsCount(bank)

  return (
    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#F1F5F9] pt-3">
      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFB] px-2.5 py-2 text-xs font-semibold text-[#374151]">
        <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} strokeWidth={2} />
        <span className="truncate">{questionsLabel}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFB] px-2.5 py-2 text-xs font-semibold text-[#374151]">
        <RotateCcw className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" strokeWidth={2} />
        <span className="truncate">{formatBankUsageCount(bank)}</span>
      </div>
    </div>
  )
}

export default BankCardStatsBar
