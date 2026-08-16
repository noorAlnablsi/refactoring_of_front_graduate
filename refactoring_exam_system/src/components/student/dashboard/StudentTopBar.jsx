import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getActiveMembership } from '../../../lib/workspaceContext'
import { useAuthStore } from '../../../store/authStore'
import GlobalSearchBox from '../../dashboard/GlobalSearchBox'
import UserAvatar from '../../dashboard/UserAvatar'

function StudentTopBar({ onMenuClick, menuOpen = false }) {
  const { t } = useTranslation(['student', 'auth', 'navigation'])
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name || t('brand.quizHub', { ns: 'auth' })

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 md:px-6 lg:px-[37px]">
      <div className="flex w-full min-w-0 items-center gap-3 md:gap-4 lg:gap-6">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)] lg:hidden"
            aria-label={t('topBar.openMenu', { ns: 'navigation' })}
            aria-expanded={menuOpen}
            aria-controls="app-mobile-nav"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null}

        <p className="hidden min-w-0 shrink-0 truncate text-sm font-bold text-[var(--shell-accent)] md:block">
          {workspaceName}
        </p>

        <GlobalSearchBox
          placeholder={t('topbar.searchPlaceholder')}
          className="relative min-w-0 flex-1"
        />

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="hidden min-w-0 text-start sm:block">
              <p className="truncate text-sm font-medium leading-tight text-[var(--shell-accent)]">
                {user?.full_name || t('portal.defaultName')}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--shell-text-subtle)]">
                {t('topbar.profileLabel')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default StudentTopBar
