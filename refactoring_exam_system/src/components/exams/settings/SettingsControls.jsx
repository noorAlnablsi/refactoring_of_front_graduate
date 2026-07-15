import { AlertTriangle, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SettingsSwitch({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-1 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#2A3433]">{label}</p>
        {description ? <p className="mt-1 text-xs leading-6 text-[#94A3B8]">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-[#2AA8A2]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
          }`}
        />
      </button>
    </label>
  )
}

export function SettingsRadio({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#F6F8F9] px-4 py-3.5">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked ? 'border-[#2AA8A2]' : 'border-[#CBD5E1]'
        }`}
      >
        {checked ? <span className="h-2.5 w-2.5 rounded-full bg-[#2AA8A2]" /> : null}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  )
}

export function SeverityCard({ tone, title, text }) {
  const { t } = useTranslation('exams')
  const isAction = tone === 'action'

  return (
    <div
      className={`rounded-xl p-4 ${
        isAction ? 'bg-[#FEF2F2] ring-1 ring-[#FECACA]' : 'bg-[#E8F7F6] ring-1 ring-[#CFECE9]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isAction ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          ) : (
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#2AA8A2]" />
          )}
          <div>
            <p
              className={`text-sm font-extrabold ${
                isAction ? 'text-[#DC2626]' : 'text-[#2AA8A2]'
              }`}
            >
              {title}
            </p>
            <p className="mt-2 text-xs leading-6 text-[#64748B]">{text}</p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-bold text-[#94A3B8] hover:text-[#64748B]"
        >
          {t('settings.severity.edit')}
        </button>
      </div>
    </div>
  )
}
