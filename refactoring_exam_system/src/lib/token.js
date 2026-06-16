export function isAccessTokenExpired(token, bufferSeconds = 30) {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return true
    return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000
  } catch {
    return true
  }
}
