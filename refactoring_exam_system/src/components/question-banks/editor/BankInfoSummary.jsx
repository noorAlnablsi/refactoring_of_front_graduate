import VisibilityBadge from '../VisibilityBadge'

function BankInfoSummary({ bank }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#2AA8A2]">المشروع الأكاديمي</p>
          <h1 className="mt-1 text-4xl font-extrabold text-[#2A3433]">إنشاء بنك أسئلة جديد</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            قم ببناء بنك أسئلة أكاديمي شامل من خلال تحديد المعلومات الأساسية وإضافة أسئلة متنوعة لتقييم طلابك.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">اسم البنك</p>
          <p className="mt-1 text-sm font-bold text-[#2A3433]">{bank.title}</p>
        </div>
        <div className="rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">المادة</p>
          <p className="mt-1 text-sm font-bold text-[#2A3433]">{bank.subject_name || '—'}</p>
        </div>
        <div className="rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">الخصوصية الحالية</p>
          <div className="mt-1">
            <VisibilityBadge value={bank.visibility} />
          </div>
        </div>
      </div>
      {bank.description ? <p className="mt-4 text-sm text-[#64748B]">{bank.description}</p> : null}
    </section>
  )
}

export default BankInfoSummary
