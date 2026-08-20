import i18n from '../i18n'
import { translateBackendMessage } from '../i18n/translateBackendMessage'

const KNOWN_CODES = ['PROCTORING_THRESHOLD_EXCEEDED']


export function formatIntegrityMessage(raw) {
  if (raw == null || raw === '') return ''

  const text = String(raw).trim()
  let output = translateBackendMessage(text)

  for (const code of KNOWN_CODES) {
    if (!output.includes(code)) continue
    const localized = i18n.t(`integrity.codes.${code}`, {
      ns: 'analytics',
      defaultValue: code,
    })
    output = output.split(code).join(localized)
  }

  return output
}
