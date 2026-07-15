import { useTranslation } from 'react-i18next'

export function useAppTranslation(namespace = 'common') {
  return useTranslation(namespace)
}
