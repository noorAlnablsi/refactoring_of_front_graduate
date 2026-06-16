function QuestionBanksEmptyState({ searching, onCreate }) {
  if (searching) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-lg font-bold text-[#2A3433]">لا توجد نتائج مطابقة للبحث</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <p className="text-xl font-bold text-[#2A3433]">No Question Banks Yet</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
      >
        Create Your First Question Bank
      </button>
    </div>
  )
}

export default QuestionBanksEmptyState
