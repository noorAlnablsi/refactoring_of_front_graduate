import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { shellInputClass } from '../../lib/shellUi'

function SettingsPasswordField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete = 'current-password',
}) {
  const { t } = useTranslation('forms')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--shell-text-muted)]">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`h-12 w-full px-12 text-sm ${shellInputClass}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--shell-text-subtle)] transition hover:text-[var(--shell-text-muted)]"
          aria-label={showPassword ? t('aria.hidePassword') : t('aria.showPassword')}
        >
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
        {Icon ? (
          <Icon
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--shell-accent)]"
            strokeWidth={2}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SettingsPasswordField
