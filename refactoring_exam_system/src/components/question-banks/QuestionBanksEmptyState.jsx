const EMPTY_MESSAGES = {
  my: {
    title: 'لا توجد بنوك خاصة بعد',
    description: 'أنشئ بنك أسئلة خاصاً لاستخدامه في اختباراتك.',
  },
  workspace: {
    title: 'لا توجد بنوك ضمن المؤسسة',
    description: 'ستظهر هنا بنوك المواد المشتركة التي أنشأها زملاؤك أو أنت.',
  },
  community: {
    title: 'لا توجد بنوك مجتمع بعد',
    description: 'ستظهر هنا البنوك العامة المنشورة على مستوى المنصة.',
  },
}

function QuestionBanksEmptyState({ searching, tab, onCreate }) {
  if (searching) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-lg font-bold text-[#2A3433]">لا توجد نتائج مطابقة للبحث</p>
      </div>
    )
  }

  const message = EMPTY_MESSAGES[tab] || EMPTY_MESSAGES.my

  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <p className="text-xl font-bold text-[#2A3433]">{message.title}</p>
      <p className="mt-3 text-sm text-[#64748B]">{message.description}</p>
      {tab === 'my' ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
        >
          إنشاء أول بنك أسئلة
        </button>
      ) : null}
    </div>
  )
}

export default QuestionBanksEmptyState
