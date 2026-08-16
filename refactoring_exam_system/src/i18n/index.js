import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE } from '../constants/language'
import { localizeDigitsInString } from '../lib/localeDigits'
import { readStoredLanguage } from '../lib/language'
import arAnalytics from './ar/analytics.json'
import arAuth from './ar/auth.json'
import arBackendMessages from './ar/backendMessages.json'
import arCommon from './ar/common.json'
import arDashboard from './ar/dashboard.json'
import arExams from './ar/exams.json'
import arForms from './ar/forms.json'
import arInvites from './ar/invites.json'
import arLanding from './ar/landing.json'
import arGroups from './ar/groups.json'
import arMembers from './ar/members.json'
import arNavigation from './ar/navigation.json'
import arQuestionBanks from './ar/questionBanks.json'
import arSettings from './ar/settings.json'
import arStudent from './ar/student.json'
import arSubjects from './ar/subjects.json'
import arSurveys from './ar/surveys.json'
import enAnalytics from './en/analytics.json'
import enAuth from './en/auth.json'
import enBackendMessages from './en/backendMessages.json'
import enCommon from './en/common.json'
import enDashboard from './en/dashboard.json'
import enExams from './en/exams.json'
import enForms from './en/forms.json'
import enInvites from './en/invites.json'
import enLanding from './en/landing.json'
import enGroups from './en/groups.json'
import enMembers from './en/members.json'
import enNavigation from './en/navigation.json'
import enQuestionBanks from './en/questionBanks.json'
import enSettings from './en/settings.json'
import enStudent from './en/student.json'
import enSubjects from './en/subjects.json'
import enSurveys from './en/surveys.json'

const localizeDigitsPostProcessor = {
  name: 'localizeDigits',
  type: 'postProcessor',
  process(value, _key, options, translator) {
    if (typeof value !== 'string' || !value) return value
    const lng = options?.lng || translator?.language || i18n.language
    const isArabic = String(lng || '').toLowerCase().startsWith('ar')
    return localizeDigitsInString(value, isArabic)
  },
}

const resources = {
  ar: {
    analytics: arAnalytics,
    auth: arAuth,
    backendMessages: arBackendMessages,
    common: arCommon,
    dashboard: arDashboard,
    exams: arExams,
    forms: arForms,
    invites: arInvites,
    landing: arLanding,
    groups: arGroups,
    members: arMembers,
    navigation: arNavigation,
    questionBanks: arQuestionBanks,
    settings: arSettings,
    student: arStudent,
    subjects: arSubjects,
    surveys: arSurveys,
  },
  en: {
    analytics: enAnalytics,
    auth: enAuth,
    backendMessages: enBackendMessages,
    common: enCommon,
    dashboard: enDashboard,
    exams: enExams,
    forms: enForms,
    invites: enInvites,
    landing: enLanding,
    groups: enGroups,
    members: enMembers,
    navigation: enNavigation,
    questionBanks: enQuestionBanks,
    settings: enSettings,
    student: enStudent,
    subjects: enSubjects,
    surveys: enSurveys,
  },
}

i18n
  .use(initReactI18next)
  .use(localizeDigitsPostProcessor)
  .init({
    resources,
    lng: readStoredLanguage(),
    fallbackLng: LANGUAGE.EN,
    defaultNS: 'common',
    ns: [
      'common',
      'navigation',
      'forms',
      'backendMessages',
      'auth',
      'dashboard',
      'analytics',
      'members',
      'groups',
      'subjects',
      'questionBanks',
      'exams',
      'settings',
      'student',
      'surveys',
      'invites',
      'landing',
    ],
    postProcess: ['localizeDigits'],
    interpolation: {
      escapeValue: false,
      format(value, format, lng) {
        if (typeof value !== 'number' || !Number.isFinite(value)) return value
        const locale = String(lng || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
        if (format === 'percent') {
          return `${value.toLocaleString(locale)}%`
        }
        return value.toLocaleString(locale)
      },
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
