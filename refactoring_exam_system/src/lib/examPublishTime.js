/** Format as naive local datetime without Z suffix (backend APP_TIMEZONE). */
export function toNaiveLocalDateTime(date) {
  const value = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(value.getTime())) return null

  const pad = (n) => String(n).padStart(2, '0')
  return [
    `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    `T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`,
  ].join('')
}
