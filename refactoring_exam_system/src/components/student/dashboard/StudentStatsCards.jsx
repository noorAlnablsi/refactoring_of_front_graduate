import { useTranslation } from 'react-i18next'
import { BarChart3, Calendar, CheckCircle2, ClipboardList } from 'lucide-react'
import { formatLocaleNumber, formatLocalePaddedNumber } from '../../../lib/localeNumber'

const CARD_CLASS =
  'relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80'

function StatCard({ label, value, icon: Icon, iconBg, accentClassName }) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <div className="mt-auto text-right">
          <p className="text-[13px] font-medium leading-5 text-[#64748B]">{label}</p>
          <p className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-[#2A3433]">
            {value}
          </p>
        </div>
      </div>
      <div className={`h-1 w-full shrink-0 ${accentClassName}`} aria-hidden="true" />
    </div>
  )
}

function StudentStatsCards({ stats }) {
  const { t } = useTranslation('student')

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('stats.availableExams')}
        value={formatLocalePaddedNumber(stats.availableExams ?? 0)}
        icon={ClipboardList}
        iconBg="bg-[#E8F7F6] text-[#2AA8A2]"
        accentClassName="bg-[#2AA8A2]"
      />
      <StatCard
        label={t('stats.upcoming')}
        value={formatLocalePaddedNumber(stats.upcomingExams ?? 0)}
        icon={Calendar}
        iconBg="bg-[#EFF6FF] text-[#3B82F6]"
        accentClassName="bg-[#3B82F6]"
      />
      <StatCard
        label={t('stats.completed')}
        value={formatLocalePaddedNumber(stats.completedExams ?? 0)}
        icon={CheckCircle2}
        iconBg="bg-[#E8F7F6] text-[#2AA8A2]"
        accentClassName="bg-[#2AA8A2]"
      />
      <StatCard
        label={t('stats.averageScore')}
        value={`${formatLocaleNumber(stats.averageScore ?? 0)}%`}
        icon={BarChart3}
        iconBg="bg-[#E8F7F6] text-[#2AA8A2]"
        accentClassName="bg-[#2AA8A2]"
      />
    </div>
  )
}

export default StudentStatsCards
