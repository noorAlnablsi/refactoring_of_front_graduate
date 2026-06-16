import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import { ROUTES } from '../../constants/routes'
import { useStudentJoinCodeGuard } from '../../hooks/useStudentRegisterFlow'
import { registerStudent } from '../../services/join.service'
import { useRegistrationStore } from '../../store/registrationStore'
import loginHero from '../../assets/auth/login-hero.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function StudentJoinCodePage() {
  useStudentJoinCodeGuard()
  const navigate = useNavigate()
  const store = useRegistrationStore()
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!store.join_code.trim()) {
      setError('كود الانضمام مطلوب')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await registerStudent({
        full_name: store.full_name.trim(),
        email: store.email.trim(),
        password: store.password,
        join_code: store.join_code.trim(),
      })

      updateFields({
        student_api_completed: true,
        dev_otp: response.dev_otp || '',
      })

      navigate(ROUTES.REGISTER_OTP)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell heroImage={loginHero} heroAlt="إصقل تقييمك الأكاديمي">
      <h1 className="text-right text-3xl font-extrabold text-[#2A3433] md:text-4xl">أهلاً بك في كويزهاب</h1>
      <p className="mt-3 text-right text-sm leading-7 text-[#6B7280] md:text-base">
        أدخل كود الانضمام المقدم من مؤسستك التعليمية
      </p>

      <div className="mt-8 space-y-2">
        <label className="block text-right text-sm font-semibold text-[#374151]">كود الانضمام</label>
        <input
          value={store.join_code}
          onChange={(e) => updateFields({ join_code: e.target.value.toUpperCase() })}
          placeholder="M3YOV311"
          className={inputClassName}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 disabled:opacity-70 md:w-[448px]"
      >
        {loading ? 'جاري التسجيل...' : 'دخول'}
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

export default StudentJoinCodePage
