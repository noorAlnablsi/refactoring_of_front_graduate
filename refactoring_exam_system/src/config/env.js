

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:5000'
const DEFAULT_FRONTEND_BASE_URL = 'http://localhost:5173'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL


function resolveWsBaseUrl() {
  const explicit = String(import.meta.env.VITE_WS_BASE_URL || '').trim().replace(/\/$/, '')
  if (explicit) return explicit

  const httpUrl = new URL(API_BASE_URL)
  const protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${httpUrl.host}`
}

export const WS_BASE_URL = resolveWsBaseUrl()


export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : DEFAULT_FRONTEND_BASE_URL)
