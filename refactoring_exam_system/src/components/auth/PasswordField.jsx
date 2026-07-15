import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error = '',
  name,
  autoComplete = 'new-password',
}) {
  const { t } = useTranslation(['auth', 'forms'])
  const [showPassword, setShowPassword] = useState(false)
  const resolvedPlaceholder = placeholder || t('passwordField.defaultPlaceholder')

  return (
    <div className="space-y-2">
      <label className="block text-right text-sm font-semibold text-[#374151]">{label}</label>
      <div className="relative w-full md:w-[448px]">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={resolvedPlaceholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl bg-[#EEF2F3] px-4 pl-12 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#6B7280]"
          aria-label={
            showPassword ? t('aria.hidePassword', { ns: 'forms' }) : t('aria.showPassword', { ns: 'forms' })
          }
        >
          {showPassword ? (
            <Eye className="h-5 w-5" strokeWidth={1.9} />
          ) : (
            <EyeOff className="h-5 w-5" strokeWidth={1.9} />
          )}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

export default PasswordField
