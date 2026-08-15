import { ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { formatIntegrityMessage } from '../../../lib/integrityDisplay'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../../lib/shellUi'

/**
 * Shown when backend auto-ended the attempt for proctoring threshold.
 * Not the timeout / student-submit / teacher-force screens.
 */
function AttemptProctoringTerminatedScreen({ attempt, testName }) {
  const { t } = useTranslation('student')
  const navigate = useNavigate()

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[var(--shell-bg)] px-4 py-10 text-[var(--shell-text)]"
      data-a11y-scale-root
      data-app-shell="exam"
    >
      <section className={`w-full max-w-lg p-5 text-center sm:p-8 ${shellCardClass}`}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2]">
          <ShieldAlert className="h-8 w-8 text-[#DC2626]" strokeWidth={2.2} />
        </span>

        <h1 className={`mt-6 text-2xl ${shellPageTitleClass}`}>
          {t('attempt.proctoringTerminated.title')}
        </h1>
        <p className={`mt-3 text-sm leading-7 ${shellBodyTextClass}`}>
          {t('attempt.proctoringTerminated.message')}
        </p>

        {testName ? (
          <p className={`mt-4 text-xs font-semibold ${shellSubtleTextClass}`}>{testName}</p>
        ) : null}

        {attempt?.termination_reason ? (
          <p className={`mt-2 text-[11px] ${shellSubtleTextClass}`}>
            {formatIntegrityMessage(attempt.termination_reason)}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => navigate(ROUTES.STUDENT_DASHBOARD, { replace: true })}
          className={`mt-8 inline-flex ${shellAccentButtonClass} px-6 py-3 text-sm`}
        >
          {t('attempt.proctoringTerminated.backToDashboard')}
        </button>
      </section>
    </main>
  )
}

export default AttemptProctoringTerminatedScreen
