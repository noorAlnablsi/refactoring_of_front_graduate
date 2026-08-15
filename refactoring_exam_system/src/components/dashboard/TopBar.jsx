import { HelpCircle, Menu, Search } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { getLanguageDirection } from '../../lib/language'
import { getActiveMembership } from '../../lib/workspaceContext'
import { getMembershipShortLabel } from '../../lib/membershipLabel'
import { useAuthStore } from '../../store/authStore'
import { useLanguageStore } from '../../store/languageStore'
import UserAvatar from './UserAvatar'

function TopBar({ searchPlaceholder, onMenuClick, menuOpen = false }) {
  const { t } = useAppTranslation('navigation')
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
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
          <div className="relative w-full max-w-[609px]">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]"
              strokeWidth={2}
            />
            <input
              type="search"
              dir={dir}
              placeholder={placeholder}
              className="h-9 w-full rounded-full border-0 bg-[var(--shell-search-bg)] pt-[3px] pe-10 ps-4 pb-1 text-sm text-[var(--shell-text)] outline-none placeholder:text-sm placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/25"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
