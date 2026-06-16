import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SEC, REGISTRATION_FLOW } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { resendOtp, verifyOtp } from '../services/auth.service'
import { useRegistrationStore } from '../store/registrationStore'

export function useOtpVerification() {
  const navigate = useNavigate()
  const email = useRegistrationStore((s) => s.email)
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

  const isStudentFlow = registration_flow === REGISTRATION_FLOW.STUDENT

  useEffect(() => {
    if (isLeavingRef.current) return

    if (!email) {
      if (isStudentFlow) {
        navigate(ROUTES.STUDENT_REGISTER, { replace: true })
      } else {
        navigate(ROUTES.REGISTER_SELECT_ROLE, { replace: true })
      }
      return
    }

    if (isStudentFlow && !student_api_completed) {
      navigate(ROUTES.STUDENT_JOIN_CODE, { replace: true })
    }
  }, [email, isStudentFlow, student_api_completed, navigate])

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
        setError('يرجى إدخال رمز التحقق المكوّن من 6 أرقام')
        return
      }

      setLoading(true)
      setError('')
      setSuccessMessage('')

      try {
        const result = await verifyOtp({ email, otp: otpCode })
        setVerifyResult(result)
        setSuccessMessage('تم التحقق بنجاح')

        if (isStudentFlow) {
          const registeredEmail = email
          isLeavingRef.current = true
          navigate(ROUTES.LOGIN, {
            replace: true,
            state: { fromRegistration: true, email: registeredEmail, isStudent: true },
          })
          reset()
          return
        }

        navigate(ROUTES.REGISTER_SUCCESS)
      } catch (err) {
        const match = err.message.match(/(\d+)\s*attempts?\s*remaining/i)
        if (match) {
          setOtpAttemptsRemaining(Number(match[1]))
          setError(`رمز التحقق غير صحيح - ${match[1]} محاولات متبقية`)
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
      navigate,
      otpValue,
      reset,
      setOtpAttemptsRemaining,
      setVerifyResult,
    ],
  )

  useEffect(() => {
    if (otpValue.length === OTP_LENGTH && !loading && lastSubmittedOtp.current !== otpValue) {
      lastSubmittedOtp.current = otpValue
      verify(otpValue)
    }
  }, [otpValue, loading, verify])

  const handleResend = async () => {
    if (cooldown > 0) return

    setResendLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await resendOtp({ email })
      updateFields({ dev_otp: result.dev_otp || '' })
      setSuccessMessage('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني')
      setCooldown(OTP_RESEND_COOLDOWN_SEC)
      setDigits(Array(OTP_LENGTH).fill(''))
      lastSubmittedOtp.current = ''
    } catch (err) {
      setError(err.message)
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
  }
}
