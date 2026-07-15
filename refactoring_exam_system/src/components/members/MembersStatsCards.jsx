import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, UserRound } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { formatStatValue } from '../../lib/subjectDisplay'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function MembersStatCard({
  title,
  description,
  value,
  loading,
  icon: Icon,
  emoji,
  actionLabel,
  actionTo,
  comingSoonLabel,
}) {
  const displayValue = loading ? '…' : formatStatValue(value ?? 0)

  const actionClassName = `mt-auto w-full justify-center ${shellAccentButtonClass}`

  return (
    <div className={`relative flex min-h-[220px] flex-col overflow-hidden ${shellCardClass}`}>
      <span className="absolute left-4 top-4 text-2xl" aria-hidden="true">
        {emoji}
      </span>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>

        <div className="mt-5 text-right">
          <p className="text-base font-bold text-[var(--shell-text)]">{title}</p>
          <p className={`mt-1 text-sm leading-6 ${shellBodyTextClass}`}>{description}</p>
          <p
            className={`mt-3 text-[36px] leading-none tracking-tight text-[var(--shell-accent)] ${shellPageTitleClass}`}
          >
            {displayValue}
          </p>
        </div>

        {actionTo ? (
          <Link to={actionTo} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" disabled title={comingSoonLabel} className={`${actionClassName} opacity-70`}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function MembersStatsCards({ studentsTotal, teachersTotal, loading, isInstitution }) {
  const { t } = useTranslation(['members', 'common'])

  return (
    <div className={`grid gap-4 ${isInstitution ? 'md:grid-cols-2' : 'max-w-xl'}`}>
      <MembersStatCard
        title={t('stats.studentsTitle')}
        description={t('stats.studentsDescription')}
        value={studentsTotal}
        loading={loading}
        icon={UserRound}
        emoji="🎓"
        actionLabel={t('stats.viewStudents')}
        actionTo={ROUTES.MEMBERS_STUDENTS}
        comingSoonLabel={t('comingSoon', { ns: 'common' })}
      />
      {isInstitution ? (
        <MembersStatCard
          title={t('stats.teachersTitle')}
          description={t('stats.teachersDescription')}
          value={teachersTotal}
          loading={loading}
          icon={GraduationCap}
          emoji="👨‍🏫"
          actionLabel={t('stats.viewTeachers')}
          actionTo={ROUTES.MEMBERS_TEACHERS}
          comingSoonLabel={t('comingSoon', { ns: 'common' })}
        />
      ) : null}
    </div>
  )
}

export default MembersStatsCards
