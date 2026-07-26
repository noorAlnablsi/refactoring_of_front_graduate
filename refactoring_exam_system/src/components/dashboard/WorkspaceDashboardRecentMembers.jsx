import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import {
  formatBankUpdatedLabel,
  getDashboardMemberAvatarUrl,
  getDashboardMemberRoleLabel,
} from '../../lib/workspaceDashboardModel'
import UserAvatar from './UserAvatar'
import { shellBodyTextClass, shellCardClass, shellSectionTitleClass, shellSubtleTextClass } from '../../lib/shellUi'

function WorkspaceDashboardRecentMembers({ members, loading }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className={`flex h-full flex-col ${shellCardClass}`}>
      <div className="border-b border-[var(--shell-border)] px-5 py-4">
        <h2 className={shellSectionTitleClass}>{t('recentMembers.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('recentMembers.empty')}</p>
      ) : (
        <ul className="flex-1">
          {members.map((member) => (
            <li
              key={member.membership_id ?? member.user_id}
              className="flex items-center gap-3 border-b border-[var(--shell-border)] px-5 py-3.5 last:border-b-0"
            >
              <UserAvatar
                user={{
                  full_name: member.full_name,
                  avatar_url: getDashboardMemberAvatarUrl(member),
                }}
                size="sm"
                rounded
              />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-bold text-[var(--shell-text)]">{member.full_name}</p>
                <p className={`mt-0.5 truncate text-xs ${shellSubtleTextClass}`}>
                  {getDashboardMemberRoleLabel(member.role)}
                </p>
              </div>
              <span className={`shrink-0 text-xs ${shellSubtleTextClass}`}>
                {formatBankUpdatedLabel(member.joined_at)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-[var(--shell-border)] px-5 py-3">
        <Link
          to={ROUTES.MEMBERS}
          className="text-sm font-bold text-[var(--shell-accent)] transition hover:opacity-90"
        >
          {t('recentMembers.viewAll')}
        </Link>
      </div>
    </section>
  )
}

export default WorkspaceDashboardRecentMembers
