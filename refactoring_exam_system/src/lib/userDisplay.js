export function getUserInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }

  return name.slice(0, 2).toUpperCase() || 'م'
}

/** Skip placeholder / broken CDN URLs so UI falls back to initials. */
export function resolveAvatarUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/cdn\.example\.com/i.test(trimmed)) return null
  if (/^https?:\/\/(www\.)?example\.(com|org|net)\b/i.test(trimmed)) return null

  // Relative upload paths must hit the API host, not the Vite origin.
  if (trimmed.startsWith('/')) {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000').replace(
      /\/$/,
      '',
    )
    return `${apiBase}${trimmed}`
  }

  return trimmed
}
