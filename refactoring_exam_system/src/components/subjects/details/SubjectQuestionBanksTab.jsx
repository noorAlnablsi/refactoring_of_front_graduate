import { FileQuestion } from 'lucide-react'
import {
  getQuestionBankName,
  getQuestionBankVisibilityLabel,
  sortByRecentDate,
} from '../../../lib/subjectDisplay'

function SubjectQuestionBanksTab({ questionBanks }) {
  const banks = sortByRecentDate(questionBanks)

  if (banks.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">لا توجد بنوك أسئلة مرتبطة بهذه المادة</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {banks.map((bank) => (
        <div
          key={bank.id}
          className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#64748B]">
            <FileQuestion className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#2A3433]">{getQuestionBankName(bank)}</h3>
              {bank.visibility ? (
                <span className="rounded-md bg-[#E8F7F6] px-2 py-0.5 text-[11px] font-bold text-[#2AA8A2]">
                  {getQuestionBankVisibilityLabel(bank)}
                </span>
              ) : null}
            </div>
            {bank.description ? (
              <p className="mt-2 text-sm leading-7 text-[#64748B]">{bank.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubjectQuestionBanksTab
