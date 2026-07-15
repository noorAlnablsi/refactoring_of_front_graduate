import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ownedQuestionBankCardClassName } from '../../lib/questionBanks'

function QuestionBankCreateCard({ onClick }) {
  const { t } = useTranslation('questionBanks')

  return (
    <button
      type="button"
      dir="rtl"
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#A7E3DA] bg-white p-6 text-center transition hover:border-[#22C1A3]/70 hover:bg-[#F8FCFB] active:scale-[0.995] ${ownedQuestionBankCardClassName}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F3] text-[#0EA896]">
        <Plus className="h-7 w-7" strokeWidth={2} />
      </span>
      <p className="mt-4 text-base font-bold text-[#111827]">{t('createCard.title')}</p>
      <p className="mt-2 max-w-[220px] text-[13px] leading-6 text-[#6B7280]">{t('createCard.subtitle')}</p>
    </button>
  )
}

export default QuestionBankCreateCard
