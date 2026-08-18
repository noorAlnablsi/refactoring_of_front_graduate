import { FRONTEND_BASE_URL } from '../config/env'

export function buildInvitePreviewUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}`
}

export function buildInviteRegisterUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}/register`
}

export function buildInviteAcceptUrl(token) {
  return `${FRONTEND_BASE_URL}/invites/${token}/accept`
}
