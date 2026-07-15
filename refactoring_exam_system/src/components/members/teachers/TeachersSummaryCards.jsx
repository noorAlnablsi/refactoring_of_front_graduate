import { useTranslation } from 'react-i18next'
import { formatStatValue } from '../../../lib/subjectDisplay'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function TeachersSummaryCards({ total, activeRate, loading }) {
  const { t } = useTranslation('members')
  const totalValue = loading ? '…' : formatStatValue(total)
  const rateValue = loading ? '…' : `${activeRate}%`

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={`flex min-h-[120px] flex-col justify-between px-5 py-4 ${shellCardClass}`}>
        <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('teachers.total')}</p>
        <p className={`text-[32px] leading-none text-[var(--shell-accent)] ${shellPageTitleClass}`}>
          {totalValue}
        </p>
      </div>

      <div className={`flex min-h-[120px] flex-col justify-between px-5 py-4 ${shellCardClass}`}>
        <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('teachers.activityStatus')}</p>
        <p className={`text-[32px] leading-none text-[var(--shell-accent)] ${shellPageTitleClass}`}>
          {rateValue}
        </p>
        <p className={`text-xs ${shellBodyTextClass}`}>{t('teachers.activeRateDescription')}</p>
      </div>
    </div>
  )
}

export default TeachersSummaryCards
