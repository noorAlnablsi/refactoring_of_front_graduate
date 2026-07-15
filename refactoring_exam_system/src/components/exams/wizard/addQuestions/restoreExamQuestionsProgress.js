import { EXAM_QUESTIONS_VIEWS, getExamWizardProgress } from '../../../../lib/examWizardProgress'
import { resolveBankById, resolveBanksByIds } from './examAddQuestionsBanks'

export async function restoreExamQuestionsProgress({ testId, hasQuestions }) {
  try {
    const progress = getExamWizardProgress(testId)
    const savedQuestions = progress?.questions

    if (!savedQuestions) {
      if (hasQuestions) {
        return { kind: 'review', reviewSource: 'exam' }
      }
      return { kind: 'idle' }
    }

    switch (savedQuestions.view) {
      case EXAM_QUESTIONS_VIEWS.REVIEW:
        return {
          kind: 'review',
          reviewSource: savedQuestions.reviewSource || 'exam',
        }
      case EXAM_QUESTIONS_VIEWS.FROM_BANK_QUESTIONS: {
        const bank = await resolveBankById(savedQuestions.bankId)
        if (!bank) return { kind: 'idle' }
        return {
          kind: 'from-bank',
          bank,
          selectedQuestionIds: savedQuestions.selectedQuestionIds || [],
        }
      }
      case EXAM_QUESTIONS_VIEWS.MANUAL:
        return { kind: 'manual' }
      case EXAM_QUESTIONS_VIEWS.RANDOM_BLUEPRINT: {
        const banks = await resolveBanksByIds(savedQuestions.bankIds || [])
        if (!banks.length) return { kind: 'idle' }
        return {
          kind: 'random-blueprint',
          banks,
          blueprints: savedQuestions.blueprints || null,
        }
      }
      case EXAM_QUESTIONS_VIEWS.METHOD_PICKER:
      default:
        return { kind: 'idle' }
    }
  } catch {
    return { kind: 'idle' }
  }
}
