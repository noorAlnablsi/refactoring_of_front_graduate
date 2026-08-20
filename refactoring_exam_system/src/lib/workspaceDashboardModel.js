import i18n from '../i18n'
import { localizeDigits } from './localeNumber'

function tDashboard(key, options = {}) {
  return i18n.t(key, { ns: 'dashboard', ...options })
}

function tCommon(key, options = {}) {
  return i18n.t(key, { ns: 'common', ...options })
}

const ROLE_LABEL_KEYS = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  OWNER: 'owner',
}

export function getDashboardMemberRoleLabel(role) {
  const key = ROLE_LABEL_KEYS[String(role || '').toUpperCase()]
  return key ? tCommon(`roles.${key}`) : role || ''
}

export function getDashboardMemberAvatarUrl(member) {
  return member?.avatar_url || member?.profile_image_url || null
}

export function formatAverageScorePercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const num = Number(value)
  const rounded = Math.round(num * 10) / 10
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  return `${rounded.toLocaleString(locale)}%`
}

export function resolveExamSchedule(test) {
  const dateRaw = test?.exam_date || test?.starts_at_date || null
  const timeRaw = test?.exam_time || test?.starts_at_time || null
  let date = null

  if (dateRaw) {
    const parsed = new Date(String(dateRaw).includes('T') ? dateRaw : `${dateRaw}T12:00:00`)
    if (!Number.isNaN(parsed.getTime())) date = parsed
  } else if (test?.starts_at) {
    const parsed = new Date(test.starts_at)
    if (!Number.isNaN(parsed.getTime())) date = parsed
  }

  return { date, time: timeRaw || null }
}

export function formatExamDateBadge(date) {
  if (!date || Number.isNaN(date.getTime())) return null
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const month = date.toLocaleDateString(locale, { month: 'short' })
  const day = date.toLocaleDateString(locale, { day: 'numeric' })
  return { month, day }
}

export function formatExamTimeLabel(time) {
  if (!time) return tDashboard('upcoming.timeUnavailable')
  return localizeDigits(time)
}

export function formatBankUpdatedLabel(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return tDashboard('relative.now')
  if (minutes < 60) return tDashboard('relative.minutesAgo', { count: minutes })

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return tDashboard('relative.hoursAgo', { count: hours })

  const days = Math.floor(hours / 24)
  if (days === 1) return tDashboard('relative.yesterday')
  if (days < 7) return tDashboard('relative.daysAgo', { count: days })

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export function formatTrendWeekdayLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(String(dateString).includes('T') ? dateString : `${dateString}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  return date.toLocaleDateString(locale, { weekday: 'short' })
}

export function computeTrendChangePercent(points = []) {
  if (!points || points.length < 2) return null
  const first = Number(points[0].value)
  const last = Number(points[points.length - 1].value)
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null
  if (first === 0) return last === 0 ? 0 : null
  return Math.round(((last - first) / Math.abs(first)) * 1000) / 10
}

export function formatTrendChangePercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null
  const num = Number(value)
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const abs = Math.abs(num).toLocaleString(locale, {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 1,
    maximumFractionDigits: 1,
  })
  if (num > 0) return `+${abs}%`
  if (num < 0) return `−${abs}%`
  return `${abs}%`
}

function buildSmoothLinePath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2
    d += ` Q ${current.x} ${current.y} ${midX} ${midY}`
  }
  const last = points[points.length - 1]
  d += ` T ${last.x} ${last.y}`
  return d
}

function buildSmoothAreaPath(points, width, height, padding) {
  const line = buildSmoothLinePath(points)
  if (!line) return ''
  const last = points[points.length - 1]
  const first = points[0]
  return `${line} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`
}

export function buildTrendChartPoints(data = [], width = 320, height = 120, padding = 12) {
  const points = (data || [])
    .map((item) => ({
      date: item.date,
      value: Number(item.average_score),
      gradedAttempts: item.graded_attempts,
      label: formatTrendWeekdayLabel(item.date),
    }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))

  if (points.length === 0) {
    return { points: [], polyline: '', area: '', linePath: '', areaPath: '', changePercent: null }
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const mapped = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : padding + (index / (points.length - 1)) * innerW
    const y = padding + innerH - ((point.value - min) / range) * innerH
    return { ...point, x, y }
  })

  const polyline = mapped.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`
  const linePath = buildSmoothLinePath(mapped)
  const areaPath = buildSmoothAreaPath(mapped, width, height, padding)

  return {
    points: mapped,
    polyline,
    area,
    linePath,
    areaPath,
    changePercent: computeTrendChangePercent(mapped),
  }
}
