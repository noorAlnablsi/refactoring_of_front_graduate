import { useEffect, useState } from 'react'
import { INSTITUTION_APPROVAL_POLL_INTERVAL_SEC } from '../constants/auth'
import { checkInstitutionApprovalStatus } from '../services/auth.service'

export function useInstitutionApprovalPolling({ enabled, email, password }) {
  const [status, setStatus] = useState('pending')
  const [checking, setChecking] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState('')

  useEffect(() => {
    if (!enabled || !email || !password) return undefined

    let cancelled = false

    const check = async () => {
      setChecking(true)
      try {
        const result = await checkInstitutionApprovalStatus({ email, password })
        if (cancelled) return

        if (result.status === 'approved') {
          setStatus('approved')
          return
        }

        if (result.status === 'rejected') {
          setStatus('rejected')
          setRejectionMessage(result.message || 'تم رفض طلب التسجيل من قبل الإدارة.')
          return
        }

        setStatus('pending')
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    check()
    const interval = setInterval(check, INSTITUTION_APPROVAL_POLL_INTERVAL_SEC * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [enabled, email, password])

  return { status, checking, rejectionMessage }
}
