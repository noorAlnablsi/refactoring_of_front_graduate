import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import RegisterProgress from '../../components/auth/RegisterProgress'
import RoleSelector from '../../components/auth/RoleSelector'
import { ROUTES } from '../../constants/routes'
import { REGISTRATION_FLOW, WORKSPACE_KIND } from '../../constants/auth'
import { useRegistrationStore } from '../../store/registrationStore'
import registerHero from '../../assets/auth/register-hero-step1.png'

const inputClassName =
  'h-12 w-full rounded-xl bg-[#EEF2F3] px-4 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/40 md:w-[448px]'

function RegisterSelectRolePage() {
  const navigate = useNavigate()
  const store = useRegistrationStore()
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const setWorkspaceKind = useRegistrationStore((s) => s.setWorkspaceKind)
  const setRegistrationFlow = useRegistrationStore((s) => s.setRegistrationFlow)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setRegistrationFlow(REGISTRATION_FLOW.INSTITUTION)
  }, [setRegistrationFlow])

  useEffect(() => {
    if (!store.workspace_kind) {
      setWorkspaceKind(WORKSPACE_KIND.INSTITUTION)
    }
  }, [store.workspace_kind, setWorkspaceKind])

  const validate = () => {
    const nextErrors = {}

    if (!store.workspace_kind) {
      nextErrors.workspace_kind = 'يرجى اختيار نوع الحساب'
    }
    if (!store.full_name.trim()) nextErrors.full_name = 'الاسم الكامل مطلوب'
    if (!store.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email.trim())) {
      nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة'
    }
    if (!store.phone_number.trim()) nextErrors.phone_number = 'رقم التواصل مطلوب'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (!validate()) return

    if (store.workspace_kind === WORKSPACE_KIND.SOLO) {
      updateFields({ workspace_name: store.full_name.trim() })
    }

    navigate(ROUTES.REGISTER_PASSWORD)
  }

  return (
    <AuthShell heroImage={registerHero} heroAlt="أنشئ اختباراتك بسهولة">
      <RegisterProgress activeStep={1} />

      <RoleSelector selected={store.workspace_kind} onSelect={setWorkspaceKind} />
      {errors.workspace_kind ? (
        <p className="mt-2 text-sm text-red-600">{errors.workspace_kind}</p>
      ) : null}

      <form
        className="mt-6"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault()
          handleNext()
        }}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-right text-sm font-semibold text-[#374151]">الاسم الكامل</label>
            <input
              type="text"
              name="register-full-name"
              value={store.full_name}
              onChange={(e) => updateFields({ full_name: e.target.value })}
              placeholder="أدخل اسمك الكامل"
              autoComplete="off"
              className={inputClassName}
            />
            {errors.full_name ? <p className="text-sm text-red-600">{errors.full_name}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-right text-sm font-semibold text-[#374151]">البريد الإلكتروني</label>
            <input
              type="email"
              name="register-email"
              value={store.email}
              onChange={(e) => updateFields({ email: e.target.value })}
              placeholder="أدخل بريدك الإلكتروني"
              autoComplete="off"
              className={inputClassName}
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-right text-sm font-semibold text-[#374151]">رقم التواصل</label>
            <input
              type="tel"
              name="register-phone"
              value={store.phone_number}
              onChange={(e) => updateFields({ phone_number: e.target.value })}
              placeholder="أدخل رقم التواصل"
              autoComplete="off"
              className={inputClassName}
            />
            {errors.phone_number ? (
              <p className="text-sm text-red-600">{errors.phone_number}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 h-12 w-full rounded-xl bg-[#2AA8A2] text-base font-bold text-white shadow-[0_12px_20px_rgba(42,168,162,0.22)] transition hover:opacity-95 md:w-[448px]"
        >
          التالي
        </button>
      </form>
    </AuthShell>
  )
}

export default RegisterSelectRolePage
