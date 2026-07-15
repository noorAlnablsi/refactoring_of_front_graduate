import i18n from '../i18n'

export const INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
}

export const INVITE_ASSIGNABLE_ROLES = [
  { value: 'STUDENT' },
  { value: 'TEACHER' },
  { value: 'ADMIN' },
]

const INVITE_STATUS_I18N_KEYS = {
  [INVITE_STATUS.ACCEPTED]: 'accepted',
  [INVITE_STATUS.REJECTED]: 'rejected',
  [INVITE_STATUS.EXPIRED]: 'expired',
}

export function getInviteStatusMessage(status) {
  const key = INVITE_STATUS_I18N_KEYS[status]
  if (!key) return null
  return i18n.t(`status.${key}`, { ns: 'invites' })
}

/** @deprecated Use getInviteStatusMessage(status) */
export const INVITE_STATUS_MESSAGES = {
  [INVITE_STATUS.PENDING]: null,
  get [INVITE_STATUS.ACCEPTED]() {
    return getInviteStatusMessage(INVITE_STATUS.ACCEPTED)
  },
  get [INVITE_STATUS.REJECTED]() {
    return getInviteStatusMessage(INVITE_STATUS.REJECTED)
  },
  get [INVITE_STATUS.EXPIRED]() {
    return getInviteStatusMessage(INVITE_STATUS.EXPIRED)
  },
}
