import { localizeDigits } from '../../../lib/localeNumber'

function formatGraceClock(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return localizeDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
}

/**
 * Connection / offline-grace banner for the attempt screen.
 * Matches existing attempt alert styling (no new design system).
 */
function AttemptOfflineBanner({ phase, graceRemainingSeconds, softOffline = false, t }) {
  if (phase === 'grace') {
    return (
      <p
        role="status"
        className="mb-4 rounded-xl bg-[#FFF7ED] px-4 py-3 text-sm font-semibold text-[#C2410C]"
      >
        {t('attempt.offline.graceActive', {
          time: formatGraceClock(graceRemainingSeconds),
        })}
      </p>
    )
  }

  if (phase === 'frozen') {
    return (
      <p
        role="alert"
        className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
      >
        {t('attempt.offline.frozenAwaitingReconnect')}
      </p>
    )
  }

  if (softOffline) {
    return (
      <p
        role="status"
        className="mb-4 rounded-xl bg-[#F1F5F9] px-4 py-3 text-sm font-semibold text-[#475569]"
      >
        {t('attempt.offline.softOfflineContinue')}
      </p>
    )
  }

  return null
}

export default AttemptOfflineBanner
