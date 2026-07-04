import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import QuestionBuilderForm from '../question-banks/editor/QuestionBuilderForm'
import { isRichTextEmpty } from '../../lib/richText'
import { validateQuestionChoiceRules } from '../../lib/questionBanks'
import { getSubjectTopics } from '../../services/subjects.service'
import { addManualQuestions } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function createDefaultQuestion() {
  return {
    body: '',
    type_code: 'MCQ',
    difficulty: 'EASY',
    points: 1,
    topic_id: '',
    choices: [
      { body: '', is_correct: true },
      { body: '', is_correct: false },
    ],
  }
}

function normalizeQuestionForApi(question) {
  const payload = {
    body: question.body.trim(),
    type_code: question.type_code,
    difficulty: question.difficulty,
    points: Number(question.points) || 1,
  }

  if (question.type_code !== 'ESSAY') {
    payload.choices = question.choices.map((choice) => ({
      body: choice.body.trim(),
      is_correct: Boolean(choice.is_correct),
    }))
  }

  if (question.topic_id) {
    payload.topic_id = Number(question.topic_id)
  }

  return payload
}

function extractTopicsList(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.topics)) return payload.topics
  if (Array.isArray(payload.subject_topics)) return payload.subject_topics
  if (Array.isArray(payload.data)) return payload.data
  return []
}

function ExamManualQuestionsPanel({
  test,
  testId,
  onBack,
  onSaveDraft,
  onSuccess,
  onViewQuestions,
  savingDraft = false,
}) {
  const showToast = useToastStore((s) => s.showToast)
  const [draft, setDraft] = useState(createDefaultQuestion())
  const [topics, setTopics] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const examName = test?.title || test?.name || 'الامتحان'

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
    if (isRichTextEmpty(draft.body)) {
      showToast('نص السؤال مطلوب', 'error')
      return false
    }
    if (!draft.points || Number(draft.points) < 1) {
      showToast('العلامة يجب أن تكون أكبر من 0', 'error')
      return false
    }
    if (draft.type_code !== 'ESSAY') {
      const hasEmptyChoice = draft.choices.some((choice) => !choice.body.trim())
      if (hasEmptyChoice) {
        showToast('جميع الخيارات مطلوبة', 'error')
        return false
      }
      const choiceError = validateQuestionChoiceRules(draft.type_code, draft.choices)
      if (choiceError) {
        showToast(choiceError, 'error')
        return false
      }
    }
    if (topics.length > 0 && !draft.topic_id) {
      showToast('اختر المحور للسؤال', 'error')
      return false
    }
    return true
  }

  const saveQuestion = async (resetAfter) => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await addManualQuestions(testId, {
        questions: [normalizeQuestionForApi(draft)],
      })
      showToast('تمت إضافة السؤال')
      if (resetAfter) {
        setDraft(createDefaultQuestion())
      }
      await onSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">إنشاء يدوي</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          كتابة أسئلة الامتحان
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          أنشئ أسئلة جديدة خاصة بـ «{examName}». الأسئلة اليدوية تُضاف للامتحان فقط ولا تُحفظ في
          بنك الأسئلة.
        </p>
      </header>

      <QuestionBuilderForm
        value={draft}
        onChange={setDraft}
        onSave={() => saveQuestion(false)}
        onAddAnother={() => saveQuestion(true)}
        topics={topics}
      />

      <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-[#E5E9EB] bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            {onViewQuestions ? (
              <button
                type="button"
                onClick={onViewQuestions}
                className="rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)]"
              >
                عرض أسئلة الامتحان
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {submitting ? (
        <p className="text-xs text-[#94A3B8]">جاري الحفظ...</p>
      ) : null}
    </div>
  )
}

export default ExamManualQuestionsPanel
