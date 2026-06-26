const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

export function buildInvitePreviewUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}`
}

export function buildInviteRegisterUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}/register`
}

export function buildInviteAcceptUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}/accept`
}
