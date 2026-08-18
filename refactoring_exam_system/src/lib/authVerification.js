import { REGISTRATION_FLOW } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { resendOtp } from '../services/auth.service'
import { useRegistrationStore } from '../store/registrationStore'

export function isEmailNotVerifiedError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('email not verified') ||
    normalized.includes('لم يتم التحقق من البريد') ||
    normalized.includes('لم يتم التحقق من بريدك')
  )
}

export function isAccountAlreadyExistsError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('account already exists') ||
    normalized.includes('email is already registered') ||
    normalized.includes('الحساب موجود بالفعل') ||
    normalized.includes('البريد الإلكتروني مسج')
  )
}

export function isEmailAlreadyVerifiedError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('email is already verified') ||
    normalized.includes('تم التحقق من البريد الإلكتروني بالفعل')
  )
}

export function isAlreadyWorkspaceMemberError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('already a member of this workspace') ||
    normalized.includes('عضو بالفعل في مساحة العمل')
  )
}

export function isInvalidOtpError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('invalid') ||
    normalized.includes('expired') ||
    normalized.includes('incorrect') ||
    normalized.includes('غير صالح') ||
    normalized.includes('غير صحيح') ||
    normalized.includes('منته')
  )
}

export function isOtpResendLimitError(message) {
  const normalized = String(message || '').toLowerCase()
  return (
    normalized.includes('otp resend limit') ||
    normalized.includes('حد إعادة إرسال')
  )
}

export function isMisleadingOtpExistsError(message) {
  return isAccountAlreadyExistsError(message) || isInvalidOtpError(message)
}

export async function beginEmailVerificationFlow({
  email,
  password = '',
  navigate,
  resend = false,
  replace = false,
}) {
  const trimmedEmail = String(email || '').trim()
  if (!trimmedEmail) return false

  let otpResent = false
  let devOtp = ''
  let resendError = ''

  if (resend) {
    try {
      const result = await resendOtp({ email: trimmedEmail })
      otpResent = true
      devOtp = result.dev_otp || ''
    } catch (err) {
      resendError = err?.message || ''
    }
  }

  useRegistrationStore.getState().updateFields({
    email: trimmedEmail,
    password: password || useRegistrationStore.getState().password,
    registration_flow: REGISTRATION_FLOW.EMAIL_VERIFICATION,
    student_api_completed: true,
    dev_otp: devOtp,
  })

  navigate(ROUTES.REGISTER_OTP, {
    replace,
    state: {
      email: trimmedEmail,
      pendingEmailVerification: true,
      otpResent,
      resendError,
      devOtp,
    },
  })
  return true
}
