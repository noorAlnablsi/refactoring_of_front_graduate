import i18n from '../i18n'
import { ROUTES } from '../constants/routes'
import {
  IMAGE_ONLY_QUESTION_BODY,
  isImageOnlyPlaceholderBody,
  resolveQuestionImageSrc,
  toQuestionImagePath,
} from './questionImage'
import { getPlainTextFromHtml, isRichTextEmpty } from './richText'

function tQB(key, options = {}) {
  return i18n.t(key, { ns: 'questionBanks', ...options })
}

function getCountLocale() {
  return String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US'
}

const VISIBILITY_KEYS = {
  PRIVATE: 'private',
  WORKSPACE: 'workspace',
  COMMUNITY: 'community',
}

const QUESTION_TYPE_KEYS = {
  MCQ: 'mcq',
  TRUE_FALSE: 'trueFalse',
  MULTI_SELECT: 'multiSelect',
  ESSAY: 'essay',
}

const DIFFICULTY_KEYS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

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

export const OWNED_QUESTION_BANK_CARD_SIZE = {
  width: 293.33,
  height: 321,
}

export const ownedQuestionBankCardClassName = 'h-[321px] w-full min-w-0'

export const communityQuestionBankCardClassName = ownedQuestionBankCardClassName

export const questionBanksGridClassName =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
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

export function getBankAuthorName(bank) {
  return (
    bank?.author_name ||
    bank?.created_by_name ||
    bank?.owner_name ||
    bank?.created_by?.full_name ||
    bank?.creator?.name ||
    bank?.creator_name ||
    null
  )
}

export function getBankAuthorAvatar(bank) {
  return (
    bank?.author_avatar_url ||
    bank?.created_by_avatar_url ||
    bank?.owner_avatar_url ||
    bank?.created_by?.avatar_url ||
    bank?.creator?.avatar_url ||
    null
  )
}

export function getCommunityBankAuthorName(bank) {
  return getBankAuthorName(bank)
}

export function getCommunityBankAuthorAvatar(bank) {
  return getBankAuthorAvatar(bank)
}

export function getCommunityBankRating(bank) {
  const value = bank?.rating ?? bank?.average_rating ?? bank?.stars
  if (value == null || value === '') return 5
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 5
  return Math.min(5, Math.max(0, numeric))
}

export function getBankUsageCount(bank) {
  const value =
    bank?.usage_count ?? bank?.uses_count ?? bank?.imports_count ?? bank?.download_count

  if (value == null || value === '') return 0
  const numeric = Number(value)
  return Number.isNaN(numeric) ? 0 : numeric
}

export function getCommunityBankUsageCount(bank) {
  return getBankUsageCount(bank)
}

export function formatBankUsageCount(bank) {
  const count = getBankUsageCount(bank)
  return tQB('counts.usage', { count: count.toLocaleString(getCountLocale()) })
}

export function formatCommunityQuestionsCount(bank) {
  const count = getBankQuestionsCount(bank)
  if (count == null || Number.isNaN(count)) return '—'
  return tQB('counts.questions', { count: count.toLocaleString(getCountLocale()) })
}

export function formatCommunityUsageCount(bank) {
  return formatBankUsageCount(bank)
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

export function getTrueFalseChoices() {
  return [
    { body: tQB('choices.true'), is_correct: true },
    { body: tQB('choices.false'), is_correct: false },
  ]
}

export const VISIBILITY_OPTIONS = ['PRIVATE', 'WORKSPACE', 'COMMUNITY'].map((value) => ({
  value,
  get label() {
    return getVisibilityLabel(value)
  },
}))

export const QUESTION_TYPE_OPTIONS = ['MCQ', 'TRUE_FALSE', 'MULTI_SELECT', 'ESSAY'].map((value) => ({
  value,
  get label() {
    return getQuestionTypeLabel(value)
  },
}))

export const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'].map((value) => ({
  value,
  get label() {
    return getDifficultyLabel(value)
  },
}))

export function getVisibilityOptionsForWorkspace(isInstitution) {
  if (isInstitution) return VISIBILITY_OPTIONS
  return VISIBILITY_OPTIONS.filter((option) => option.value !== 'WORKSPACE')
}

export function getVisibilityLabel(value) {
  const key = VISIBILITY_KEYS[value]
  if (key) return tQB(`visibility.${key}`)
  return value || '—'
}

export function getDifficultyLabel(value) {
  const key = DIFFICULTY_KEYS[value]
  if (key) return tQB(`difficulty.${key}`)
  return value || '—'
}

export function getQuestionTypeLabel(value) {
  const key = QUESTION_TYPE_KEYS[value]
  if (key) return tQB(`types.${key}`)
  return value || '—'
}

export function getQuestionTopicLabel(question, topics = []) {
  if (question?.topic_name || question?.topic?.name || question?.topic_title || question?.topic_label) {
    return question.topic_name || question.topic?.name || question.topic_title || question.topic_label
  }

  if (question?.topic_id != null && topics.length) {
    const topic = topics.find(
      (item) => String(item.id ?? item.topic_id ?? item.value) === String(question.topic_id),
    )
    if (topic?.name) return topic.name
  }

  return question?.topic_id
    ? tQB('editor.topicNumber', { id: question.topic_id })
    : tQB('editor.noTopic')
}

export function validateQuestionChoiceRules(typeCode, choices = []) {
  if (typeCode === 'ESSAY') return ''

  const correctCount = choices.filter((choice) => choice.is_correct).length

  if (typeCode === 'MULTI_SELECT') {
    if (correctCount < 2) {
      return tQB('validation.multiSelectMinCorrect')
    }
    return ''
  }

  if (typeCode === 'MCQ' || typeCode === 'TRUE_FALSE') {
    if (correctCount !== 1) {
      return tQB('validation.singleSelectOneCorrect')
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
  return date.toLocaleDateString(getCountLocale())
}

export function formatBankCardDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(getCountLocale(), {
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

  if (value == null || value === '') {

    if (bank && Object.prototype.hasOwnProperty.call(bank, 'questions_count')) return 0
    return null
  }
  return Number(value)
}

export function formatBankQuestionsCount(bank) {
  const count = getBankQuestionsCount(bank)
  if (count == null || Number.isNaN(count)) return '—'
  return tQB('counts.questionsAccusative', { count: count.toLocaleString(getCountLocale()) })
}

/** Backend question-banks API accepts image_path only (not image_url). */
export function normalizeQuestionBankQuestionForApi(question) {
  const imagePath = toQuestionImagePath(question?.image_path || question?.image_url)

  let body = isRichTextEmpty(question?.body) ? '' : String(question.body).trim()
  if (isImageOnlyPlaceholderBody(body)) body = ''
  if (!body && imagePath) {
    body = IMAGE_ONLY_QUESTION_BODY
  }

  const payload = {
    body,
    type_code: question.type_code,
    difficulty: question.difficulty,
    points: Number(question.points) || 1,
  }

  if (imagePath) {
    payload.image_path = imagePath
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = (question.choices || []).map((choice) => ({
      body: String(choice.body || '').trim(),
      is_correct: Boolean(choice.is_correct),
    }))
  }

  if (question.topic_id) {
    payload.topic_id = Number(question.topic_id)
  }

  return payload
}

/** Enrich API question rows so UI can always resolve image_url. */
export function normalizeQuestionBankQuestionFromApi(question) {
  if (!question || typeof question !== 'object') return question

  const imagePath = toQuestionImagePath(
    question.image_path ||
      question.snapshot_image_path ||
      question.image_url ||
      question.snapshot_image_url,
  )
  const imageUrl =
    question.image_url ||
    question.snapshot_image_url ||
    resolveQuestionImageSrc({ image_path: imagePath }) ||
    ''

  return {
    ...question,
    image_path: imagePath,
    image_url: imageUrl,
  }
}

/** Keep display fields (image_url) when staging questions before publish. */
export function normalizeQuestionBankQuestionForDisplay(question) {
  const apiPayload = normalizeQuestionBankQuestionForApi(question)
  const imagePath =
    apiPayload.image_path ||
    toQuestionImagePath(question?.image_path || question?.image_url)

  return {
    ...question,
    ...apiPayload,
    body: apiPayload.body,
    image_path: imagePath,
    image_url:
      question?.image_url ||
      question?.snapshot_image_url ||
      resolveQuestionImageSrc({ image_path: imagePath }) ||
      '',
  }
}
