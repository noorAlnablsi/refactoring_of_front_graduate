import { Link } from 'react-router-dom'
import { ChevronLeft, Globe, Lock, LogOut } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useLogout } from '../../hooks/useLogout'
import SettingsCard from './SettingsCard'
import ThemeModeToggle from './ThemeModeToggle'
function SettingsAppearanceCard() {
  return (
    <SettingsCard title="المظهر واللغة" icon={Globe}>
      <div className="space-y-1">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--shell-text-muted)]">اللغة</span>
          <select
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm text-[var(--shell-text-muted)] opacity-70 outline-none"
            defaultValue="ar"
          >
            <option value="ar">العربية</option>
          </select>
        </label>

        <Link
          to={ROUTES.SETTINGS_CHANGE_PASSWORD}
          className="flex w-full items-center justify-between rounded-xl px-1 py-3.5 text-sm font-semibold text-[var(--shell-text)] transition hover:bg-[var(--shell-hover)]"
        >
          <span>تغيير كلمة المرور</span>
          <ChevronLeft className="h-4 w-4 text-[var(--shell-text-subtle)]" />
        </Link>

        <div className="flex items-center justify-between rounded-xl px-1 py-3.5">
          <span className="text-sm font-semibold text-[var(--shell-text)]">النمط</span>
          <ThemeModeToggle />
        </div>
      </div>
    </SettingsCard>
  )
}

function SettingsPrivacyCard() {
  const { logoutAllSessions, loading } = useLogout()

  return (
    <SettingsCard title="الخصوصية والبيانات" icon={Lock}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={logoutAllSessions}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm font-bold text-[var(--shell-danger-text)] transition hover:bg-[var(--shell-hover)] disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loading ? 'جاري الخروج...' : 'تسجيل خروج من المنصة'}
        </button>

        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[var(--shell-danger-bg)] px-4 py-3 text-sm font-bold text-[var(--shell-danger-text)] opacity-60"
        >
          حذف الحساب نهائياً
        </button>
      </div>
    </SettingsCard>
  )
}

export { SettingsAppearanceCard, SettingsPrivacyCard }
