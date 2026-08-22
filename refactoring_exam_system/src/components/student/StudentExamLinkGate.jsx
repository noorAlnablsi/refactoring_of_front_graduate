import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { stashPendingExamRedirect } from '../../lib/studentExamDeepLink'
import { shellAccentButtonClass, shellCardClass, shellPageTitleClass } from '../../lib/shellUi'
import { useAuthStore } from '../../store/authStore'

function StudentExamLinkGate({ redirectPath }) {
  const { t } = useTranslation('student')
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLoginAsStudent = () => {
    stashPendingExamRedirect(redirectPath)
    clearAuth()
    navigate(ROUTES.LOGIN, {
      replace: true,
      state: { redirectTo: redirectPath },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--shell-bg)] px-4 py-10">
      <section className={`w-full max-w-lg p-6 text-center sm:p-8 ${shellCardClass}`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
          <GraduationCap className="h-7 w-7" strokeWidth={2} />
        </span>
        <h1 className={`mt-5 text-2xl ${shellPageTitleClass}`}>{t('examLinkGate.title')}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--shell-text-muted)]">
          {t('examLinkGate.body')}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={handleLoginAsStudent} className={shellAccentButtonClass}>
            {t('examLinkGate.loginAsStudent')}
          </button>
          <Link
            to={ROUTES.DASHBOARD}
            className="text-sm font-bold text-[var(--shell-accent)] hover:opacity-90"
          >
            {t('examLinkGate.backToDashboard')}
          </Link>
        </div>
      </section>
    </main>
  )
}

export default StudentExamLinkGate
