import { Link } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import PasswordField from '../../components/auth/PasswordField'
import { ROUTES } from '../../constants/routes'
import { useInviteRegister } from '../../hooks/useInviteRegister'
import loginHero from '../../assets/auth/login-hero.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function InviteRegisterPage() {
  const {
    preview,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loadingPreview,
    submitting,
    error,
    fieldErrors,
    submit,
  } = useInviteRegister()

  const invitedEmail = preview?.invited_email || ''
  const assignedRole = preview?.assigned_role || ''

  return (
    <AuthShell heroImage={loginHero} heroAlt="إكمال التسجيل عبر الدعوة">
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">أكمل تسجيلك</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        تمت دعوتك للانضمام إلى مساحة تعليمية. أكمل بيانات حسابك للمتابعة.
      </p>

      {loadingPreview ? (
        <p className="mt-8 text-sm text-[#64748B]">جاري تحميل بيانات الدعوة...</p>
      ) : (
        <form
          className="mt-8"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          {invitedEmail ? (
            <div className="mb-5 space-y-2">
              <label className="block text-right text-sm font-semibold text-[#374151]">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={invitedEmail}
                readOnly
                className={`${inputClassName} cursor-not-allowed bg-[#F3F5F6] text-[#64748B]`}
              />
            </div>
          ) : null}

          {assignedRole ? (
            <p className="mb-5 text-right text-sm text-[#64748B]">
              الدور المعيّن: <span className="font-semibold text-[#374151]">{assignedRole}</span>
            </p>
          ) : null}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-right text-sm font-semibold text-[#374151]">الاسم الكامل</label>
              <input
                type="text"
                name="invite-register-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                autoComplete="off"
                className={inputClassName}
              />
              {fieldErrors.full_name ? (
                <p className="text-sm text-red-600">{fieldErrors.full_name}</p>
              ) : null}
            </div>

            <PasswordField
              label="اختر كلمة سر"
              name="invite-register-password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />

            <PasswordField
              label="تأكيد كلمة السر"
              name="invite-register-confirm-password"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirm_password}
            />
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !preview}
            className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
          >
            {submitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        لديك حساب بالفعل؟{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-[#2AA8A2]">
          تسجيل دخول
        </Link>
      </p>
    </AuthShell>
  )
}

export default InviteRegisterPage
