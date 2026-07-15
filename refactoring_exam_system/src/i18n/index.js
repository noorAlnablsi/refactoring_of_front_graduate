import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE } from '../constants/language'
import { readStoredLanguage } from '../lib/language'
import arAuth from './ar/auth.json'
import arBackendMessages from './ar/backendMessages.json'
import arCommon from './ar/common.json'
import arDashboard from './ar/dashboard.json'
import arExams from './ar/exams.json'
import arForms from './ar/forms.json'
import arInvites from './ar/invites.json'
import arLanding from './ar/landing.json'
import arMembers from './ar/members.json'
import arNavigation from './ar/navigation.json'
import arQuestionBanks from './ar/questionBanks.json'
import arSettings from './ar/settings.json'
import arStudent from './ar/student.json'
import arSubjects from './ar/subjects.json'
import enAuth from './en/auth.json'
import enBackendMessages from './en/backendMessages.json'
import enCommon from './en/common.json'
import enDashboard from './en/dashboard.json'
import enExams from './en/exams.json'
import enForms from './en/forms.json'
import enInvites from './en/invites.json'
import enLanding from './en/landing.json'
import enMembers from './en/members.json'
import enNavigation from './en/navigation.json'
import enQuestionBanks from './en/questionBanks.json'
import enSettings from './en/settings.json'
import enStudent from './en/student.json'
import enSubjects from './en/subjects.json'

const resources = {
  ar: {
    auth: arAuth,
    backendMessages: arBackendMessages,
    common: arCommon,
    dashboard: arDashboard,
    exams: arExams,
    forms: arForms,
    invites: arInvites,
    landing: arLanding,
    members: arMembers,
    navigation: arNavigation,
    questionBanks: arQuestionBanks,
    settings: arSettings,
    student: arStudent,
    subjects: arSubjects,
  },
  en: {
    auth: enAuth,
    backendMessages: enBackendMessages,
    common: enCommon,
    dashboard: enDashboard,
    exams: enExams,
    forms: enForms,
    invites: enInvites,
    landing: enLanding,
    members: enMembers,
    navigation: enNavigation,
    questionBanks: enQuestionBanks,
    settings: enSettings,
    student: enStudent,
    subjects: enSubjects,
  },
}

i18n.use(initReactI18next).init({
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
    'members',
    'subjects',
    'questionBanks',
    'exams',
    'settings',
    'student',
    'invites',
    'landing',
  ],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
