import axios from 'axios'
import api from '../lib/axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

export async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(
    `${baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function verifyOtp(payload) {
  const { data } = await api.post('/auth/verify-otp', payload)
  return data
}

export async function resendOtp(payload) {
  const { data } = await api.post('/auth/resend-otp', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function checkInstitutionApprovalStatus({ email, password }) {
  try {
    await api.post('/auth/login', { email, password })
    return { status: 'approved' }
  } catch (error) {
    const message = String(error.message || '').toLowerCase()

    if (/reject|registration_rejected|رفض/.test(message)) {
      return { status: 'rejected', message: error.message }
    }

    if (/pending|approval|موافقة|pending_approval|not approved|awaiting/.test(message)) {
      return { status: 'pending' }
    }

    return { status: 'pending' }
  }
}
