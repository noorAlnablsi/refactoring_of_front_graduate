import { Bell, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLanguageDirection } from '../../../lib/language'
import { getActiveMembership } from '../../../lib/workspaceContext'
import { useAuthStore } from '../../../store/authStore'
import { useLanguageStore } from '../../../store/languageStore'
import UserAvatar from '../../dashboard/UserAvatar'

function StudentTopBar() {
  const { t } = useTranslation(['student', 'auth'])
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name || t('brand.quizHub', { ns: 'auth' })

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 lg:px-[37px]">
      <div className="flex w-full items-center gap-4 lg:gap-6">
        <p className="hidden shrink-0 text-sm font-bold text-[var(--shell-accent)] md:block">
          {workspaceName}
        </p>

        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]"
            strokeWidth={2}
          />
          <input
            type="search"
            dir={dir}
            placeholder={t('topbar.searchPlaceholder')}
            className="h-9 w-full rounded-full border-0 bg-[var(--shell-search-bg)] pt-[3px] pe-10 ps-4 pb-1 text-sm text-[var(--shell-text)] outline-none placeholder:text-sm placeholder:text-[var(--shell-text-subtle)] focus:ring-2 focus:ring-[var(--shell-accent)]/25"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="relative flex items-center justify-center text-[var(--shell-text-muted)]"
            aria-label={t('topbar.notificationsAria')}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            <span className="absolute -end-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>

          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="hidden text-start sm:block">
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
