import i18n from '../i18n'
import { localizeDigitsInString } from './localeDigits'

export function isArabicUiLanguage() {
  return String(i18n.language || '').toLowerCase().startsWith('ar')
}

export function getNumberLocale() {
  return isArabicUiLanguage() ? 'ar-EG' : 'en-US'
}


export function formatLocaleNumber(value, options) {
  if (value === null || value === undefined || value === '' || value === '—') return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return String(value)
  return num.toLocaleString(getNumberLocale(), options)
}


export function formatLocalePaddedNumber(value, length = 2) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  const padded = String(Math.trunc(Math.abs(num))).padStart(length, '0')
  return localizeDigits(padded)
}


export function localizeDigits(input) {
  return localizeDigitsInString(input, isArabicUiLanguage())
}


export function formatPlatformCount(count) {
  const num = Number(count)
  if (!Number.isFinite(num) || num < 0) return null
  return `+${formatLocaleNumber(Math.trunc(num))}`
}
