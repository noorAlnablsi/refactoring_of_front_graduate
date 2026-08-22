import { useTranslation } from 'react-i18next'
import QuestionStemBlock from '../../shared/QuestionStemBlock'
import GradingChoiceReview from '../../exams/GradingChoiceReview'
import { formatLocaleNumber } from '../../../lib/localeNumber'
import { isEssayQuestion } from '../../../lib/attemptAnswers'
import {
  shellBodyTextClass,
  shellCardClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../../lib/shellUi'

function StudentAttemptReviewContent({ questions = [], showCorrectAnswers = false }) {
  const { t } = useTranslation('student')

  if (!questions.length) {
    return <p className={`text-sm ${shellSubtleTextClass}`}>{t('performance.review.empty')}</p>
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const essay = isEssayQuestion(question.snapshot_type_code || question.type_code)
        return (
          <article key={question.test_question_id || index} className={`p-5 ${shellCardClass}`}>
            <h2 className={`text-base ${shellPageTitleClass}`}>
              {t('performance.review.questionNumber', { number: formatLocaleNumber(index + 1) })}
            </h2>
            <QuestionStemBlock
              question={question}
              textClassName="mt-3 text-sm font-bold leading-7 text-[var(--shell-text)]"
              imageWrapClassName="mt-4 overflow-hidden rounded-xl bg-[var(--shell-input-bg)] ring-1 ring-[var(--shell-border)]"
              imageClassName="max-h-64 w-full object-contain"
            />
            {essay ? (
              question.answer?.answer_text ? (
                <div className="mt-4 rounded-xl bg-[var(--shell-accent-bg)] p-4 text-sm leading-7 text-[var(--shell-text)]">
                  {question.answer.answer_text}
                </div>
              ) : (
                <p className={`mt-4 text-sm ${shellSubtleTextClass}`}>{t('performance.review.noAnswer')}</p>
              )
            ) : (
              <GradingChoiceReview
                question={question}
                answer={question.answer}
                hideCorrect={!showCorrectAnswers}
              />
            )}
            {question.answer?.earned_score != null ? (
              <p className={`mt-4 text-xs font-semibold ${shellBodyTextClass}`}>
                {t('performance.review.earnedScore', {
                  score: formatLocaleNumber(question.answer.earned_score),
                })}
              </p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

export default StudentAttemptReviewContent
