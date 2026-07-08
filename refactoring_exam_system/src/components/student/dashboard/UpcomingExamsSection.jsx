const TONE_DOT_CLASS = {
  teal: 'bg-[#2AA8A2]',
  blue: 'bg-[#3B82F6]',
  purple: 'bg-[#8B5CF6]',
}

function UpcomingExamsSection({ exams }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <h2 className="mb-3 text-sm font-extrabold text-[#2A3433]">الاختبارات القادمة</h2>

      {exams.length ? (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li key={exam.id} className="flex gap-2.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT_CLASS[exam.tone] || TONE_DOT_CLASS.teal}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[11px] font-semibold leading-5 text-[#94A3B8]">
                  {exam.dateLabel} • {exam.timeLabel}
                </p>
                <p className="mt-0.5 text-xs font-extrabold leading-6 text-[#2A3433]">
                  {exam.subjectCode} — {exam.title}
                </p>
                <p className="text-[11px] leading-5 text-[#64748B]">{exam.teacher}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs leading-6 text-[#94A3B8]">لا توجد اختبارات قادمة حالياً.</p>
      )}
    </section>
  )
}

export default UpcomingExamsSection
