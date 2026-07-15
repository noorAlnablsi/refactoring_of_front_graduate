import { BookOpen, FileSpreadsheet, PenLine, Shuffle, Sparkles } from 'lucide-react'

export const EXAM_QUESTION_METHODS = [
  {
    id: 'from-bank',
    titleKey: 'wizard.questions.methods.questionBank.title',
    descriptionKey: 'wizard.questions.methods.questionBank.description',
    icon: BookOpen,
    enabled: true,
  },
  {
    id: 'random',
    titleKey: 'wizard.questions.methods.random.title',
    descriptionKey: 'wizard.questions.methods.random.description',
    icon: Shuffle,
    enabled: true,
  },
  {
    id: 'manual',
    titleKey: 'wizard.questions.methods.manual.title',
    descriptionKey: 'wizard.questions.methods.manual.description',
    icon: PenLine,
    enabled: true,
  },
  {
    id: 'csv',
    titleKey: 'wizard.questions.methods.csv.title',
    descriptionKey: 'wizard.questions.methods.csv.description',
    icon: FileSpreadsheet,
    enabled: true,
  },
  {
    id: 'ai',
    titleKey: 'wizard.questions.methods.ai.title',
    descriptionKey: 'wizard.questions.methods.ai.description',
    icon: Sparkles,
    enabled: true,
  },
]

export const EXAM_QUESTIONS_REVIEW_SOURCE_KEYS = {
  random: 'random',
  'from-bank': 'fromBank',
  manual: 'manual',
  exam: 'exam',
}

export function getExamQuestionsReviewSourceKey(source) {
  return EXAM_QUESTIONS_REVIEW_SOURCE_KEYS[source] || EXAM_QUESTIONS_REVIEW_SOURCE_KEYS.exam
}
