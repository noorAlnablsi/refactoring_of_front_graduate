import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import PasswordField from '../../components/auth/PasswordField'
import { ROUTES } from '../../constants/routes'
import { useStudentRegisterGuard } from '../../hooks/useStudentRegisterFlow'
import {
  validatePassword,
  validatePasswordMatch,
} from '../../hooks/usePasswordValidation'
import { useRegistrationStore } from '../../store/registrationStore'
import loginHero from '../../assets/auth/login-hero.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function StudentRegisterPage() {
  useStudentRegisterGuard()
  const navigate = useNavigate()
  const store = useRegistrationStore()
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}

    if (!store.full_name.trim()) nextErrors.full_name = 'الاسم الكامل مطلوب'
    if (!store.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email.trim())) {
      nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة'
    }

    const passwordError = validatePassword(store.password)
    if (passwordError) nextErrors.password = passwordError

    const matchError = validatePasswordMatch(store.password, store.confirm_password)
    if (matchError) nextErrors.confirm_password = matchError

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    navigate(ROUTES.STUDENT_JOIN_CODE)
  }

  return (
    <AuthShell heroImage={loginHero} heroAlt="إصقل تقييمك الأكاديمي">
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">أهلاً بك في كويزهاب</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        املأ بيانات حسابك لتنضم الى مساحة تعليمية
      </p>

      <div className="mt-8 space-y-5">
        <div className="space-y-2">
          <label className="block text-right text-sm font-semibold text-[#374151]">الاسم الكامل</label>
          <input
            value={store.full_name}
            onChange={(e) => updateFields({ full_name: e.target.value })}
            placeholder="نوح الألفي"
            className={inputClassName}
          />
          {errors.full_name ? <p className="text-sm text-red-600">{errors.full_name}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-right text-sm font-semibold text-[#374151]">البريد الإلكتروني</label>
          <input
            type="email"
            value={store.email}
            onChange={(e) => updateFields({ email: e.target.value })}
            placeholder="dr.smith@university.edu"
            className={inputClassName}
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
        </div>

        <PasswordField
          label="اختر كلمة سر"
          value={store.password}
          onChange={(e) => updateFields({ password: e.target.value })}
          error={errors.password}
        />

        <PasswordField
          label="تأكيد كلمة السر"
          value={store.confirm_password}
          onChange={(e) => updateFields({ confirm_password: e.target.value })}
          error={errors.confirm_password}
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
      >
        التالي
      </button>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        لديك حساب بالفعل؟{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-[#2AA8A2]">
          تسجيل دخول
        </Link>
      </p>
    </AuthShell>
  )
}

export default StudentRegisterPage
