import { PASSWORD_RULES } from '../constants/auth'

export function validatePassword(password) {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return PASSWORD_RULES.message
  }
  return ''
}

export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'كلمتا المرور غير متطابقتين'
  }
  return ''
}
