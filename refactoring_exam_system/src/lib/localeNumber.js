import i18n from '../i18n'
import { localizeDigitsInString } from './localeDigits'

export function isArabicUiLanguage() {
  return String(i18n.language || '').toLowerCase().startsWith('ar')
}

export function getNumberLocale() {
  return isArabicUiLanguage() ? 'ar-EG' : 'en-US'
}

/** Format a numeric value with locale-aware digits (ar → ٠١٢…, en → 012…). */
export function formatLocaleNumber(value, options) {
  if (value === null || value === undefined || value === '' || value === '—') return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return String(value)
  return num.toLocaleString(getNumberLocale(), options)
}

/**
 * Pad a whole number then localize digits (e.g. 5 → "05" / "٠٥").
 * Keeps Latin zeros before converting when Arabic UI is active.
 */
export function formatLocalePaddedNumber(value, length = 2) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  const padded = String(Math.trunc(Math.abs(num))).padStart(length, '0')
  return localizeDigits(padded)
}

/** Convert ASCII digits ↔ Arabic-Indic according to current UI language. */
export function localizeDigits(input) {
  return localizeDigitsInString(input, isArabicUiLanguage())
}

/** Full count with leading +, locale digits (e.g. +1,250 / +١٬٢٥٠). */
export function formatPlatformCount(count) {
  const num = Number(count)
  if (!Number.isFinite(num) || num < 0) return null
  return `+${formatLocaleNumber(Math.trunc(num))}`
}
