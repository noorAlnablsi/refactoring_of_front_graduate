import { useTranslation } from 'react-i18next'
import { UserCheck, Users } from 'lucide-react'
import { formatStatValue } from '../../../lib/subjectDisplay'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function StudentsSummaryCards({ total, activeTotal, loading }) {
  const { t } = useTranslation('members')
  const totalValue = loading ? '…' : formatStatValue(total)
  const activeValue = loading ? '…' : formatStatValue(activeTotal)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={`flex min-h-[120px] items-center justify-between gap-4 px-5 py-4 ${shellCardClass}`}>
        <div>
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('students.total')}</p>
          <p className={`mt-3 text-[32px] leading-none text-[var(--shell-accent)] ${shellPageTitleClass}`}>
            {totalValue}
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Users className="h-6 w-6" strokeWidth={2} />
        </span>
      </div>

      <div className={`flex min-h-[120px] items-center justify-between gap-4 px-5 py-4 ${shellCardClass}`}>
        <div>
          <p className={`text-sm font-semibold ${shellBodyTextClass}`}>{t('students.activeNow')}</p>
          <p className={`mt-3 text-[32px] leading-none text-[var(--shell-accent)] ${shellPageTitleClass}`}>
            {activeValue}
          </p>
          <p className={`mt-2 text-xs ${shellBodyTextClass}`}>{t('students.activeDescription')}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shell-input-bg)] text-[var(--shell-text-muted)]">
          <UserCheck className="h-6 w-6" strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}

export default StudentsSummaryCards
