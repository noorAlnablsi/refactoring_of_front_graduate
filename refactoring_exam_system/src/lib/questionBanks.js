import { ROUTES } from '../constants/routes'
import { getPlainTextFromHtml } from './richText'

export const QUESTION_BANK_TABS = {
  MY: 'my',
  WORKSPACE: 'workspace',
  COMMUNITY: 'community',
}

export function getQuestionBanksListPath(tab = QUESTION_BANK_TABS.MY) {
  const params = new URLSearchParams()
  if (tab && tab !== QUESTION_BANK_TABS.MY) {
    params.set('tab', tab)
  }
  const query = params.toString()
  return query ? `${ROUTES.QUESTION_BANKS}?${query}` : ROUTES.QUESTION_BANKS
}

export function parseQuestionBanksTab(value, allowedTabs = Object.values(QUESTION_BANK_TABS)) {
  if (allowedTabs.includes(value)) return value
  return QUESTION_BANK_TABS.MY
}

/** Figma dimensions for بنوكي + ضمن المؤسسة cards */
export const OWNED_QUESTION_BANK_CARD_SIZE = {
  width: 293.33,
  height: 321,
}

export const ownedQuestionBankCardClassName = `h-[321px] w-[293.33px] shrink-0`

/** Same Figma size for community cards */
export const communityQuestionBankCardClassName = ownedQuestionBankCardClassName

const COMMUNITY_BANK_THEMES = [
  { accent: '#8B5CF6', badgeBg: '#F3E8FF', badgeText: '#7C3AED' },
  { accent: '#14B8A6', badgeBg: '#CCFBF1', badgeText: '#0D9488' },
  { accent: '#22C55E', badgeBg: '#DCFCE7', badgeText: '#16A34A' },
  { accent: '#EC4899', badgeBg: '#FCE7F3', badgeText: '#DB2777' },
  { accent: '#F97316', badgeBg: '#FFEDD5', badgeText: '#EA580C' },
]

function hashString(value) {
  const text = String(value || '')
  let hash = 0
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getCommunityBankTheme(bank) {
  const key = bank?.subject_id ?? bank?.subject_name ?? bank?.id ?? ''
  const index = hashString(key) % COMMUNITY_BANK_THEMES.length
  return COMMUNITY_BANK_THEMES[index]
}

export function getCommunityBankAuthorName(bank) {
  return (
    bank?.author_name ||
    bank?.created_by_name ||
    bank?.owner_name ||
    bank?.created_by?.full_name ||
    bank?.creator?.name ||
    bank?.creator_name ||
    'مؤلف البنك'
  )
}

export function getCommunityBankAuthorAvatar(bank) {
  return (
    bank?.author_avatar_url ||
    bank?.created_by_avatar_url ||
    bank?.owner_avatar_url ||
    bank?.created_by?.avatar_url ||
    bank?.creator?.avatar_url ||
    null
  )
}

export function getCommunityBankRating(bank) {
  const value = bank?.rating ?? bank?.average_rating ?? bank?.stars
  if (value == null || value === '') return 5
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 5
  return Math.min(5, Math.max(0, numeric))
}

export function getCommunityBankUsageCount(bank) {
  const value =
    bank?.usage_count ?? bank?.uses_count ?? bank?.imports_count ?? bank?.download_count

  if (value == null || value === '') return null
  return Number(value)
}

export function formatCommunityQuestionsCount(bank) {
  const count = getBankQuestionsCount(bank)
  if (count == null || Number.isNaN(count)) return '—'
  return `${count.toLocaleString('ar-EG')} سؤال`
}

export function formatCommunityUsageCount(bank) {
  const count = getCommunityBankUsageCount(bank)
  if (count == null || Number.isNaN(count)) return '—'
  return `${count.toLocaleString('ar-EG')} استخدام`
}

export function formatQuestionForCopy(question) {
  const lines = [getPlainTextFromHtml(question?.body)]

  if (Array.isArray(question?.choices) && question.choices.length) {
    question.choices.forEach((choice, index) => {
      const label = getPlainTextFromHtml(choice.body)
      const marker = choice.is_correct ? ' ✓' : ''
      lines.push(`${index + 1}. ${label}${marker}`)
    })
  }

  return lines.filter(Boolean).join('\n')
}

export const VISIBILITY_OPTIONS = [
  { value: 'PRIVATE', label: 'خاص' },
  { value: 'WORKSPACE', label: 'ضمن المؤسسة' },
  { value: 'COMMUNITY', label: 'مجتمع QuizHub' },
]

export const QUESTION_TYPE_OPTIONS = [
  { value: 'MCQ', label: 'اختيار واحد' },
  { value: 'TRUE_FALSE', label: 'صح / خطأ' },
  { value: 'MULTI_SELECT', label: 'خيارات متعددة' },
  { value: 'ESSAY', label: 'مقالي' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'سهل' },
  { value: 'MEDIUM', label: 'متوسط' },
  { value: 'HARD', label: 'صعب' },
]

export function getVisibilityOptionsForWorkspace(isInstitution) {
  if (isInstitution) return VISIBILITY_OPTIONS
  return VISIBILITY_OPTIONS.filter((option) => option.value !== 'WORKSPACE')
}

export function getVisibilityLabel(value) {
  return VISIBILITY_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

export function getDifficultyLabel(value) {
  return DIFFICULTY_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

export function getQuestionTypeLabel(value) {
  return QUESTION_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

/** Returns an Arabic error message, or empty string when choice rules are satisfied. */
export function validateQuestionChoiceRules(typeCode, choices = []) {
  if (typeCode === 'ESSAY') return ''

  const correctCount = choices.filter((choice) => choice.is_correct).length

  if (typeCode === 'MULTI_SELECT') {
    if (correctCount < 2) {
      return 'خيارات متعددة: حدد إجابتين صحيحتين على الأقل'
    }
    return ''
  }

  if (typeCode === 'MCQ' || typeCode === 'TRUE_FALSE') {
    if (correctCount !== 1) {
      return 'اختيار واحد: حدد إجابة صحيحة واحدة فقط'
    }
    return ''
  }

  return ''
}

export function filterActiveBanks(banks = []) {
  return banks.filter((bank) => !bank.is_archived)
}

export function filterBanksByVisibility(banks = [], visibility) {
  return banks.filter((bank) => bank.visibility === visibility)
}

export function mergeBanksById(...lists) {
  const map = new Map()
  lists.flat().forEach((bank) => {
    if (bank?.id != null) map.set(bank.id, bank)
  })
  return [...map.values()]
}

export function filterBanksBySearch(banks, search) {
  const query = search.trim().toLowerCase()
  if (!query) return banks
  return banks.filter(
    (bank) =>
      String(bank.title || '')
        .toLowerCase()
        .includes(query) ||
      String(bank.subject_name || '')
        .toLowerCase()
        .includes(query) ||
      String(bank.description || '')
        .toLowerCase()
        .includes(query),
  )
}

export function formatDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ar-EG')
}

export function formatBankCardDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getBankQuestionsCount(bank) {
  const value =
    bank?.questions_count ??
    bank?.question_count ??
    bank?.total_questions ??
    bank?.questions?.length

  if (value == null || value === '') return null
  return Number(value)
}

export function formatBankQuestionsCount(bank) {
  const count = getBankQuestionsCount(bank)
  if (count == null || Number.isNaN(count)) return '—'
  return `${count.toLocaleString('ar-EG')} سؤالاً`
}
