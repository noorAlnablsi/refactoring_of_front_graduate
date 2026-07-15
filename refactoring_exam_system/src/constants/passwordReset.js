import i18n from '../i18n'

export const PASSWORD_RESET_PURPOSE = 'RESET_PASSWORD'

export function getForgotPasswordSuccessMessage() {
  return i18n.t('passwordReset.forgotSuccessMessage', { ns: 'auth' })
}

/** @deprecated Use getForgotPasswordSuccessMessage() */
export const FORGOT_PASSWORD_SUCCESS_MESSAGE = getForgotPasswordSuccessMessage()
