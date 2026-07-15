import { Bell, HelpCircle, Search } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { getActiveMembership } from '../../lib/workspaceContext'
import { getMembershipShortLabel } from '../../lib/membershipLabel'
import { useAuthStore } from '../../store/authStore'
import UserAvatar from './UserAvatar'

function TopBar({ searchPlaceholder }) {
  const { t } = useAppTranslation('navigation')
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const roleLabel = getMembershipShortLabel(membership)
  const placeholder = searchPlaceholder ?? t('topBar.searchPlaceholder')

  return (
    <header className="flex h-16 shrink-0 items-center bg-[var(--shell-surface)] px-[37px]">
      <div dir="ltr" className="flex w-full items-center gap-6">
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="text-left">
              <p className="truncate text-sm font-medium leading-tight text-[var(--shell-accent)]">
                {user?.full_name || t('topBar.defaultUser')}
              </p>
              {roleLabel ? (
                <p className="mt-0.5 truncate text-xs font-normal leading-tight text-[var(--shell-text-muted)]">
                  {roleLabel}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="relative flex shrink-0 items-center justify-center text-[var(--shell-text-muted)]"
            aria-label={t('topBar.help')}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>

          <button
            type="button"
            className="relative flex shrink-0 items-center justify-center text-[var(--shell-text-muted)]"
            aria-label={t('topBar.notifications')}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 justify-end">
          <div className="relative w-full max-w-[609px]">
            <Search
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]"
              strokeWidth={2}
            />
            <input
              type="search"
              dir="rtl"
              placeholder={placeholder}
              className="h-9 w-full rounded-full border-0 bg-[var(--shell-search-bg)] pt-[3px] pr-10 pb-1 pl-4 text-sm text-[var(--shell-text)] outline-none placeholder:text-sm placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/25"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
