import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SEC, REGISTRATION_FLOW } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { tUI } from '../lib/appToast'
import { normalizeAuthPayload } from '../lib/authPayload'
import { waitForAuthHydration } from '../lib/authSession'
import { resolvePostLoginRoute } from '../lib/postLoginNavigation'
import {
  isEmailAlreadyVerifiedError,
  isMisleadingOtpExistsError,
  isOtpResendLimitError,
} from '../lib/authVerification'
import { login, resendOtp, verifyOtp } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'

export function useOtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = useRegistrationStore((s) => s.email)
  const dev_otp = useRegistrationStore((s) => s.dev_otp)
  const registration_flow = useRegistrationStore((s) => s.registration_flow)
  const student_api_completed = useRegistrationStore((s) => s.student_api_completed)
  const setVerifyResult = useRegistrationStore((s) => s.setVerifyResult)
  const setOtpAttemptsRemaining = useRegistrationStore((s) => s.setOtpAttemptsRemaining)
  const updateFields = useRegistrationStore((s) => s.updateFields)
  const reset = useRegistrationStore((s) => s.reset)

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const lastSubmittedOtp = useRef('')
  const isLeavingRef = useRef(false)
  const [hydrated, setHydrated] = useState(false)

  const isStudentFlow = registration_flow === REGISTRATION_FLOW.STUDENT
  const isInviteFlow = registration_flow === REGISTRATION_FLOW.INVITE
  const isEmailVerificationFlow = registration_flow === REGISTRATION_FLOW.EMAIL_VERIFICATION

  useEffect(() => {
    const stateEmail = String(location.state?.email || '').trim()
    const pendingVerification = Boolean(location.state?.pendingEmailVerification)
    const studentRegistration = Boolean(location.state?.studentRegistration)
    const otpResent = Boolean(location.state?.otpResent)
    const resendError = String(location.state?.resendError || '')
    const stateDevOtp = String(location.state?.devOtp || '')

    if (pendingVerification && stateEmail) {
      updateFields({
        email: stateEmail,
        registration_flow: REGISTRATION_FLOW.EMAIL_VERIFICATION,
        student_api_completed: true,
        dev_otp: stateDevOtp || useRegistrationStore.getState().dev_otp,
      })
      setDigits(Array(OTP_LENGTH).fill(''))
      lastSubmittedOtp.current = ''
      if (otpResent) {
        setSuccessMessage(tUI('register.otp.resentOnEntry', { ns: 'auth' }))
      } else if (resendError) {
        if (isOtpResendLimitError(resendError)) {
          setSuccessMessage(tUI('register.otp.useLastCodeHint', { ns: 'auth' }))
        } else {
          setError(resendError)
        }
      } else {
        setSuccessMessage(tUI('register.otp.enterLastCodeHint', { ns: 'auth' }))
      }
    } else if (studentRegistration && stateEmail) {
      updateFields({
        email: stateEmail,
        student_api_completed: true,
      })
    } else if (stateEmail && !useRegistrationStore.getState().email) {
      updateFields({ email: stateEmail })
    }

    setHydrated(true)
  }, [location.state, updateFields])

  useEffect(() => {
    if (!hydrated || isLeavingRef.current) return

    if (!email) {
      if (isEmailVerificationFlow) {
        navigate(ROUTES.LOGIN, { replace: true })
      } else if (isStudentFlow) {
        navigate(ROUTES.STUDENT_REGISTER, { replace: true })
      } else if (isInviteFlow) {
        navigate(ROUTES.HOME, { replace: true })
      } else {
        navigate(ROUTES.REGISTER_SELECT_ROLE, { replace: true })
      }
      return
    }

    if ((isStudentFlow || isInviteFlow) && !student_api_completed && !isEmailVerificationFlow) {
      if (isStudentFlow) {
        navigate(ROUTES.STUDENT_JOIN_CODE, { replace: true })
      } else {
        navigate(ROUTES.HOME, { replace: true })
      }
    }
  }, [hydrated, email, isStudentFlow, isInviteFlow, isEmailVerificationFlow, student_api_completed, navigate])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const otpValue = digits.join('')

  const verify = useCallback(
    async (otpCode = otpValue) => {
      if (otpCode.length !== OTP_LENGTH) {
        setError(tUI('otp.required', { ns: 'auth' }))
        return
      }

      setLoading(true)
      setError('')
      setSuccessMessage('')

      try {
        const result = await verifyOtp({ email, otp: otpCode })
        setVerifyResult(result)
        setSuccessMessage(tUI('otp.verified', { ns: 'auth' }))

        if (isStudentFlow || isInviteFlow || isEmailVerificationFlow) {
          const registeredEmail = email
          const storedPassword = useRegistrationStore.getState().password

          if (storedPassword && (isStudentFlow || isEmailVerificationFlow)) {
            try {
              await waitForAuthHydration()
              const data = normalizeAuthPayload(
                await login({ email: registeredEmail, password: storedPassword }),
              )
              useAuthStore.getState().setAuth(data)
              isLeavingRef.current = true
              reset()
              navigate(resolvePostLoginRoute(data), { replace: true })
              return
            } catch {

            }
          }

          isLeavingRef.current = true
          navigate(ROUTES.LOGIN, {
            replace: true,
            state: {
              fromRegistration: true,
              email: registeredEmail,
              isStudent: isStudentFlow,
            },
          })
          reset()
          return
        }

        navigate(ROUTES.REGISTER_SUCCESS)
      } catch (err) {
        if (isEmailAlreadyVerifiedError(err.message)) {
          isLeavingRef.current = true
          navigate(ROUTES.LOGIN, {
            replace: true,
            state: {
              fromRegistration: true,
              email,
            },
          })
          reset()
          return
        }

        const match = err.message.match(/(\d+)\s*attempts?\s*remaining/i)
        if (match) {
          setOtpAttemptsRemaining(Number(match[1]))
          setError(tUI('otp.invalidWithAttempts', { ns: 'auth', count: match[1] }))
        } else if (isMisleadingOtpExistsError(err.message)) {
          setError(tUI('register.otp.useFreshCode', { ns: 'auth' }))
        } else {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    },
    [
      email,
      isStudentFlow,
      isInviteFlow,
      isEmailVerificationFlow,
      navigate,
      otpValue,
      reset,
      setOtpAttemptsRemaining,
      setVerifyResult,
    ],
  )

  useEffect(() => {
    if (isEmailVerificationFlow) return
    if (otpValue.length === OTP_LENGTH && !loading && lastSubmittedOtp.current !== otpValue) {
      lastSubmittedOtp.current = otpValue
      verify(otpValue)
    }
  }, [isEmailVerificationFlow, otpValue, loading, verify])

  const handleResend = async () => {
    if (cooldown > 0) return

    setResendLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await resendOtp({ email })
      updateFields({ dev_otp: result.dev_otp || '' })
      setSuccessMessage(tUI('otp.resent', { ns: 'auth' }))
      setCooldown(OTP_RESEND_COOLDOWN_SEC)
      setDigits(Array(OTP_LENGTH).fill(''))
      lastSubmittedOtp.current = ''
    } catch (err) {
      if (isOtpResendLimitError(err.message)) {
        setSuccessMessage(tUI('register.otp.useLastCodeHint', { ns: 'auth' }))
      } else {
        setError(err.message)
      }
    } finally {
      setResendLoading(false)
    }
  }

  const updateDigit = (index, value) => {
    const sanitized = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = sanitized
      return next
    })
  }

  return {
    email,
    digits,
    loading,
    resendLoading,
    error,
    successMessage,
    cooldown,
    otpValue,
    updateDigit,
    verify,
    handleResend,
    setDigits,
    isStudentFlow,
    isEmailVerificationFlow,
  }
}
