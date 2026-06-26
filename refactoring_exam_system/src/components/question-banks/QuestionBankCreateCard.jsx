import { Plus } from 'lucide-react'

function QuestionBankCreateCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D7E2E4] bg-white p-6 text-center transition hover:border-[#2AA8A2]/50 hover:bg-[#F8FCFB]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F6] text-[#2AA8A2]">
        <Plus className="h-7 w-7" strokeWidth={2} />
      </span>
      <p className="mt-4 text-base font-extrabold text-[#2A3433]">إضافة بنك جديد</p>
      <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#94A3B8]">
        إنشاء من الصفر أو باستخدام قالب
      </p>
    </button>
  )
}

export default QuestionBankCreateCard
