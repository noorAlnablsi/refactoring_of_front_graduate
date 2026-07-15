import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import ExamWizardFooter from '../ExamWizardFooter'
import { getTestQuestionsCount, getTestTotalPoints } from '../../../lib/testDisplay'
import { getTestName } from '../../../lib/testModel'
import ExamRandomGeneratedQuestionsPanel from '../ExamRandomGeneratedQuestionsPanel'

function ExamReviewStep({ test, onNext, onBack, onSaveDraft, savingDraft = false }) {
  const { t } = useTranslation(['exams', 'common'])
  const questions = test?.questions || []
  const totalPoints = getTestTotalPoints(test)
  const displayQuestionsCount = getTestQuestionsCount(test)

  return (
    <div className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.review.eyebrow')}</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {t('wizard.review.title')}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">{t('wizard.review.subtitle')}</p>
      </header>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="mb-5 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#2AA8A2]" />
          <h3 className="text-base font-extrabold text-[#2A3433]">{t('wizard.review.summaryTitle')}</h3>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">{t('wizard.review.examName')}</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{getTestName(test)}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">{t('wizard.review.questionsCount')}</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{displayQuestionsCount}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">{t('wizard.review.totalPoints')}</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{totalPoints}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-4">
            <dt className="text-xs text-[#94A3B8]">{t('wizard.review.duration')}</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">
              {test?.duration_minutes
                ? t('wizard.review.durationMinutes', { count: test.duration_minutes })
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {questions.length > 0 ? (
        <ExamRandomGeneratedQuestionsPanel
          embedded
          questions={questions}
          sectionTitle={t('wizard.review.questionList')}
          continueLabel={t('wizard.review.nextPublish')}
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onContinue={onNext}
          savingDraft={savingDraft}
        />
      ) : (
        <ExamWizardFooter>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
            >
              <ArrowRight className="h-4 w-4" />
              {t('wizard.questions.review.back')}
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] disabled:opacity-50"
            >
              {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white"
            >
              {t('wizard.review.nextPublish')}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </ExamWizardFooter>
      )}
    </div>
  )
}

export default ExamReviewStep
