import i18n from '../i18n'
import { useToastStore } from '../store/toastStore'

export function tUI(key, options = {}) {
  const { ns = 'common', defaultValue, ...rest } = options
  return i18n.t(key, { ns, defaultValue, ...rest })
}

export function showAppToast(key, type = 'success', options = {}) {
  const message = tUI(key, options)
  useToastStore.getState().showToast(message, type)
}
