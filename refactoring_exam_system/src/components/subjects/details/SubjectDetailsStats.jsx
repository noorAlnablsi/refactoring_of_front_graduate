import { ClipboardList, FileQuestion, UserCheck, Users } from 'lucide-react'
import { formatStatValue } from '../../../lib/subjectDisplay'

function StatBadge({ children, tone = 'teal' }) {
  const tones = {
    teal: 'bg-[#E8F7F6] text-[#2AA8A2]',
    gray: 'bg-[#F1F5F9] text-[#64748B]',
    blue: 'bg-[#EFF6FF] text-[#3B82F6]',
    rose: 'bg-[#FFF1F2] text-[#F43F5E]',
  }

  return (
    <span className={`mt-3 inline-block rounded-md px-2 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, iconWrapClass, badge, badgeTone }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-[#2A3433]">
            {formatStatValue(value)}
          </p>
          {badge ? <StatBadge tone={badgeTone}>{badge}</StatBadge> : null}
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  )
}

function SubjectDetailsStats({ teachersCount, questionBanksCount, studentsCount }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="عدد المعلمين"
        value={teachersCount}
        icon={Users}
        iconWrapClass="bg-[#E8F7F6] text-[#2AA8A2]"
        badge="+12% هذا الشهر"
        badgeTone="teal"
      />
      <StatCard
        label="بنوك الأسئلة"
        value={questionBanksCount}
        icon={FileQuestion}
        iconWrapClass="bg-[#F1F5F9] text-[#64748B]"
        badge="محدث اليوم"
        badgeTone="gray"
      />
      <StatCard
        label="عدد الاختبارات"
        value="—"
        icon={ClipboardList}
        iconWrapClass="bg-[#EFF6FF] text-[#3B82F6]"
        badge="5 اختبارات نشطة"
        badgeTone="blue"
      />
      <StatCard
        label="الطلاب الذين تم تقييمهم"
        value={studentsCount > 0 ? studentsCount : '—'}
        icon={UserCheck}
        iconWrapClass="bg-[#FFF1F2] text-[#F43F5E]"
        badge="نسبة نجاح 88%"
        badgeTone="rose"
      />
    </div>
  )
}

export default SubjectDetailsStats
