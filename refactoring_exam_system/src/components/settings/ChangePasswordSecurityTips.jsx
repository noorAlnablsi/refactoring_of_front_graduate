import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Shield } from 'lucide-react'
import { PASSWORD_RULES } from '../../constants/auth'
import { shellCardClass } from '../../lib/shellUi'

function ChangePasswordSecurityTips({ password = '' }) {
  const { t } = useTranslation('settings')

  const tips = useMemo(
    () => [
      {
        id: 'length',
        label: t('changePassword.tips.length', { count: PASSWORD_RULES.minLength }),
        test: (value) => value.length >= PASSWORD_RULES.minLength,
      },
      {
        id: 'letters',
        label: t('changePassword.tips.letters'),
        test: (value) => /[a-zA-Z]/.test(value),
      },
      {
        id: 'symbols',
        label: t('changePassword.tips.symbols'),
        test: (value) => /[^a-zA-Z0-9]/.test(value),
      },
    ],
    [t],
  )

  return (
    <aside className={`p-6 ${shellCardClass} bg-[var(--shell-accent-bg)] ring-[var(--shell-accent)]/20`}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shell-surface)] text-[var(--shell-accent)]">
          <Shield className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="text-base font-extrabold text-[var(--shell-text)]">{t('changePassword.securityTitle')}</h2>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--shell-text-muted)]">
        {t('changePassword.securityDescription')}
      </p>

      <ul className="mt-5 space-y-3">
        {tips.map((tip) => {
          const met = password ? tip.test(password) : false

          return (
            <li key={tip.id} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  met
                    ? 'bg-[var(--shell-accent)] text-[var(--shell-accent-contrast)]'
                    : 'bg-[var(--shell-surface)] text-[var(--shell-text-subtle)]'
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className={met ? 'font-semibold text-[var(--shell-text)]' : 'text-[var(--shell-text-muted)]'}>
                {tip.label}
              </span>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default ChangePasswordSecurityTips
