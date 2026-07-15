import { PASSWORD_RULES } from '../constants/auth'
import i18n from '../i18n'

export function validatePassword(password) {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return i18n.t('validation.passwordMinLength', {
      ns: 'forms',
      count: PASSWORD_RULES.minLength,
    })
  }
  return ''
}

export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return i18n.t('validation.passwordMismatch', { ns: 'forms' })
  }
  return ''
}
