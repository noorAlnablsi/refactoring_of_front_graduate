import { HelpCircle, Menu } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { getActiveMembership } from '../../lib/workspaceContext'
import { getMembershipShortLabel } from '../../lib/membershipLabel'
import { useAuthStore } from '../../store/authStore'
import GlobalSearchBox from './GlobalSearchBox'
import UserAvatar from './UserAvatar'

function TopBar({ searchPlaceholder, onMenuClick, menuOpen = false }) {
  const { t } = useAppTranslation('navigation')
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const roleLabel = getMembershipShortLabel(membership)
  const placeholder = searchPlaceholder ?? t('topBar.searchPlaceholder')

  return (
    <header className="flex h-16 shrink-0 items-center bg-[var(--shell-surface)] px-4 md:px-6 lg:px-[37px]">
      <div className="flex w-full min-w-0 items-center gap-3 md:gap-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-4">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)] lg:hidden"
              aria-label={t('topBar.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="app-mobile-nav"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : null}

          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="hidden min-w-0 text-start sm:block">
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
            className="relative hidden shrink-0 items-center justify-center text-[var(--shell-text-muted)] sm:flex"
            aria-label={t('topBar.help')}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 justify-end">
          <GlobalSearchBox placeholder={placeholder} className="w-full max-w-[609px]" />
        </div>
      </div>
    </header>
  )
}

export default TopBar
