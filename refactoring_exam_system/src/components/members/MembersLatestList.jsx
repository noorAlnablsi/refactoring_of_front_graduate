import { useTranslation } from 'react-i18next'
import UserAvatar from '../dashboard/UserAvatar'
import {
  formatRelativeTimeAr,
  getMemberStatusBadge,
  getMemberSubtitle,
} from '../../lib/workspaceMembers'
import { shellBodyTextClass, shellCardClass, shellSectionTitleClass, shellSubtleTextClass } from '../../lib/shellUi'

function MemberLatestRow({ member }) {
  const status = getMemberStatusBadge(member.user_status)
  const user = {
    full_name: member.full_name,
    avatar_url: member.avatar_url,
  }

  return (
    <li className="flex items-center gap-4 border-b border-[var(--shell-border)] px-5 py-4 last:border-b-0">
      <UserAvatar user={user} size="sm" rounded />

      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-bold text-[var(--shell-text)]">{member.full_name}</p>
        <p className={`mt-0.5 truncate text-xs ${shellBodyTextClass}`}>{getMemberSubtitle(member)}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={`text-xs ${shellSubtleTextClass}`}>{formatRelativeTimeAr(member.created_at)}</span>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4 ${status.className}`}
        >
          {status.label}
        </span>
      </div>
    </li>
  )
}

function MembersLatestList({ members, loading }) {
  const { t } = useTranslation(['members', 'common'])

  return (
    <section className={shellCardClass}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-4">
        <button
          type="button"
          disabled
          title={t('comingSoon', { ns: 'common' })}
          className="text-sm font-bold text-[var(--shell-accent)] opacity-60"
        >
          {t('latest.viewAll')}
        </button>
        <h2 className={shellSectionTitleClass}>{t('latest.title')}</h2>
      </div>

      {loading ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('latest.loading')}</p>
      ) : members.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('latest.empty')}</p>
      ) : (
        <ul>
          {members.map((member) => (
            <MemberLatestRow
              key={`${member.memberKind}-${member.membership_id ?? member.user_id}`}
              member={member}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default MembersLatestList
