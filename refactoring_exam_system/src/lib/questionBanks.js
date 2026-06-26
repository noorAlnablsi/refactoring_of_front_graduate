export const QUESTION_BANK_TABS = {
  MY: 'my',
  WORKSPACE: 'workspace',
  COMMUNITY: 'community',
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
