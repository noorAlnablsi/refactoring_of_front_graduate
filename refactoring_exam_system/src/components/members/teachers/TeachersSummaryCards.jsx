import { useTranslation } from 'react-i18next'
import { Activity, Users } from 'lucide-react'
import { formatLocaleNumber } from '../../../lib/localeNumber'
import { formatStatValue } from '../../../lib/subjectDisplay'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

const CARD_CLASS = `relative flex min-h-[120px] flex-col overflow-hidden ${shellCardClass}`

function SummaryCard({ label, value, description, icon: Icon, accentClassName, iconBg }) {
  return (
    <div className={CARD_CLASS}>
      <div className={`absolute inset-y-0 start-0 w-1 ${accentClassName}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col justify-between gap-3 px-5 py-4 ps-6">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{label}</p>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        </div>
        <div>
          <p className={`text-[32px] leading-none text-[var(--shell-accent)] ${shellPageTitleClass}`}>
            {value}
          </p>
          {description ? (
            <p className={`mt-2 text-xs ${shellBodyTextClass}`}>{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function TeachersSummaryCards({ total, activeRate, loading }) {
  const { t } = useTranslation('members')
  const loadingDots = (
    <span className="text-[26px] text-[var(--shell-accent)]/70">…</span>
  )
  const totalValue = loading ? loadingDots : formatStatValue(total)
  const rateValue = loading ? loadingDots : `${formatLocaleNumber(activeRate)}%`

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SummaryCard
        label={t('teachers.total')}
        value={totalValue}
        icon={Users}
        iconBg="bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]"
        accentClassName="bg-[var(--shell-accent)]"
      />
      <SummaryCard
        label={t('teachers.activityStatus')}
        value={rateValue}
        description={t('teachers.activeRateDescription')}
        icon={Activity}
        iconBg="bg-[var(--shell-info-bg)] text-[var(--shell-info-text)]"
        accentClassName="bg-[var(--shell-info-text)]"
      />
    </div>
  )
}

export default TeachersSummaryCards
