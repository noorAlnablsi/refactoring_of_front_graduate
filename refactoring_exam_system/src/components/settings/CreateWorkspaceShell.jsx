import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { ROUTES } from '../../constants/routes'

function CreateWorkspaceShell({ children }) {
  const { t } = useTranslation('settings')

  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col bg-[var(--shell-bg)] font-sans text-[var(--shell-text)]"
      data-app-shell="settings"
    >
      <header className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-4 md:px-10">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-4">
          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex min-w-0 items-center gap-3 text-[var(--shell-accent)] transition hover:opacity-90"
          >
            <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            <span className="min-w-0">
              <span className="block text-base font-extrabold">{t('createWorkspace.shellTitle')}</span>
              <span className="block text-xs font-semibold text-[var(--shell-text-subtle)]">
                {t('createWorkspace.shellSubtitle')}
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--shell-text-muted)] transition hover:text-[var(--shell-accent)]"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('createWorkspace.help')}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-[640px]">{children}</div>
      </div>

      <footer className="border-t border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-6 md:px-10">
        <div className="mx-auto flex max-w-[960px] flex-col gap-4 text-xs text-[var(--shell-text-muted)] md:flex-row md:items-center md:justify-between">
          <div className="text-right">
            <p className="text-sm font-extrabold text-[var(--shell-accent)]">{t('createWorkspace.platformName')}</p>
            <p className="mt-1">{t('createWorkspace.copyright')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a href="#" className="transition hover:text-[var(--shell-accent)]">
              {t('createWorkspace.terms')}
            </a>
            <a href="#" className="transition hover:text-[var(--shell-accent)]">
              {t('createWorkspace.privacy')}
            </a>
            <a href="#" className="transition hover:text-[var(--shell-accent)]">
              {t('createWorkspace.support')}
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default CreateWorkspaceShell
