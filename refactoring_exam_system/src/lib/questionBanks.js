export const VISIBILITY_OPTIONS = [
  { value: 'PRIVATE', label: 'خاص' },
  { value: 'WORKSPACE', label: 'ضمن المؤسسة' },
  { value: 'COMMUNITY', label: 'مجتمع QuizHub' },
]

export const QUESTION_TYPE_OPTIONS = [
  { value: 'MCQ', label: 'اختيار واحد' },
  { value: 'TRUE_FALSE', label: 'صح / خطأ' },
  { value: 'MULTI_SELECT', label: 'اختيارات متعددة' },
  { value: 'ESSAY', label: 'مقالي' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'سهل' },
  { value: 'MEDIUM', label: 'متوسط' },
  { value: 'HARD', label: 'صعب' },
]

export function getVisibilityLabel(value) {
  return VISIBILITY_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

export function getDifficultyLabel(value) {
  return DIFFICULTY_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

export function getQuestionTypeLabel(value) {
  return QUESTION_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '—'
}

export function formatDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ar-EG')
}
