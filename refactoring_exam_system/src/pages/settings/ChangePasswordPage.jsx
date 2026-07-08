import { Link } from 'react-router-dom'
import { ChevronLeft, KeyRound, LockKeyhole, Save, ShieldCheck } from 'lucide-react'
import ChangePasswordSecurityTips from '../../components/settings/ChangePasswordSecurityTips'
import SettingsPasswordField from '../../components/settings/SettingsPasswordField'
import { ROUTES } from '../../constants/routes'
import { useChangePassword } from '../../hooks/useChangePassword'
import {
  shellAccentButtonClass,
  shellCardClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function ChangePasswordPage() {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    submit,
  } = useChangePassword()

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <Link to={ROUTES.DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
            الرئيسية
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <Link to={ROUTES.SETTINGS} className="transition hover:text-[var(--shell-accent)]">
            الإعدادات
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-[var(--shell-accent)]">إعادة تعيين كلمة المرور</span>
        </nav>

        <h1 className={`text-center text-2xl md:text-3xl ${shellPageTitleClass}`}>
          إعادة تعيين كلمة المرور
        </h1>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
        <ChangePasswordSecurityTips password={newPassword} />

        <section className={`p-6 md:p-8 ${shellCardClass}`}>
          <form className="space-y-5" onSubmit={submit} autoComplete="off">
            <SettingsPasswordField
              label="كلمة المرور الحالية"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="أدخل كلمة المرور الحالية"
              icon={KeyRound}
              autoComplete="current-password"
            />

            <SettingsPasswordField
              label="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              icon={LockKeyhole}
              autoComplete="new-password"
            />

            <SettingsPasswordField
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              icon={ShieldCheck}
              autoComplete="new-password"
            />

            {error ? (
              <p className="rounded-xl bg-[var(--shell-danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--shell-danger-text)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full justify-center py-3.5 ${shellAccentButtonClass} disabled:opacity-70`}
            >
              <Save className="h-4 w-4" />
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ChangePasswordPage
