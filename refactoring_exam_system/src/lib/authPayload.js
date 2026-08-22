export function extractMustResetPassword(payload) {
  if (!payload || typeof payload !== 'object') return false
  if (typeof payload.must_reset_password === 'boolean') return payload.must_reset_password
  return Boolean(payload.user?.must_reset_password)
}

export function normalizeAuthPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload

  const must_reset_password = extractMustResetPassword(payload)
  const user = payload.user
    ? { ...payload.user, must_reset_password }
    : payload.user

  return {
    ...payload,
    user,
    must_reset_password,
  }
}
