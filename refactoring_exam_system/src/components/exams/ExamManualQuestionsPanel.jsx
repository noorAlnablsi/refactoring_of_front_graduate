import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import QuestionBuilderForm from '../question-banks/editor/QuestionBuilderForm'
import ExamWizardFooter from './ExamWizardFooter'
import { showAppToast } from '../../lib/appToast'
import {
  createDefaultExamQuestion,
  normalizeManualQuestionForApi,
  validateManualQuestionForExam,
} from '../../lib/examQuestions'
import { extractTopicsList } from '../../lib/subjectTopics'
import { getSubjectTopics } from '../../services/subjects.service'
import { addManualQuestions } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function ExamManualQuestionsPanel({
  test,
  testId,
  onBack,
  onSaveDraft,
  onSuccess,
  onViewQuestions,
  savingDraft = false,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [draft, setDraft] = useState(createDefaultExamQuestion)
  const [topics, setTopics] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const examName = test?.title || test?.name || t('wizard.manual.defaultExamName')

  useEffect(() => {
    if (!test?.subject_id) return undefined

    let cancelled = false

    getSubjectTopics(test.subject_id)
      .then((data) => {
        if (!cancelled) setTopics(extractTopicsList(data))
      })
      .catch(() => {
        if (!cancelled) setTopics([])
      })

    return () => {
      cancelled = true
    }
  }, [test?.subject_id])

  const validate = () => {
    const error = validateManualQuestionForExam(draft, {
      requireTopic: topics.length > 0,
    })
    if (error) {
      showToast(error, 'error')
      return false
    }
    return true
  }

  const saveQuestion = async (resetAfter) => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await addManualQuestions(testId, {
        questions: [normalizeManualQuestionForApi(draft)],
      })
      showAppToast('wizard.manual.questionAdded', 'success', { ns: 'exams' })
      if (resetAfter) {
        setDraft(createDefaultExamQuestion())
      }
      await onSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.manual.eyebrow')}</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {t('wizard.manual.title')}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          {t('wizard.manual.subtitle', { name: examName })}
        </p>
      </header>

      <QuestionBuilderForm
        value={draft}
        onChange={setDraft}
        onSave={() => saveQuestion(false)}
        onAddAnother={() => saveQuestion(true)}
        topics={topics}
      />

      <ExamWizardFooter className="-mx-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('wizard.questions.review.back')}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
            </button>
            {onViewQuestions ? (
              <button
                type="button"
                onClick={onViewQuestions}
                className="rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)]"
              >
                {t('wizard.manual.viewExamQuestions')}
              </button>
            ) : null}
          </div>
        </div>
      </ExamWizardFooter>

      {submitting ? (
        <p className="text-xs text-[#94A3B8]">{t('common:loading.saving')}</p>
      ) : null}
    </div>
  )
}

export default ExamManualQuestionsPanel
