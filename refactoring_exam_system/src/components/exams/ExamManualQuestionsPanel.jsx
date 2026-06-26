import { useState } from 'react'
import QuestionBuilderForm from '../question-banks/editor/QuestionBuilderForm'
import { isRichTextEmpty } from '../../lib/richText'
import { validateQuestionChoiceRules } from '../../lib/questionBanks'
import { addManualQuestions } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function createDefaultQuestion() {
  return {
    body: '',
    type_code: 'MCQ',
    difficulty: 'EASY',
    points: 1,
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

  return payload
}

function ExamManualQuestionsPanel({ testId, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [draft, setDraft] = useState(createDefaultQuestion())
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    if (isRichTextEmpty(draft.body)) {
      showToast('نص السؤال مطلوب', 'error')
      return false
    }
    if (draft.type_code !== 'ESSAY') {
      const hasEmptyChoice = draft.choices.some((c) => !c.body.trim())
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
      onSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
      <h3 className="text-sm font-extrabold text-[#2A3433]">إنشاء سؤال يدوي</h3>
      <p className="mt-1 text-xs text-[#94A3B8]">
        الأسئلة اليدوية تُضاف للامتحان فقط ولا تُحفظ في بنك الأسئلة.
      </p>

      <div className="mt-4">
        <QuestionBuilderForm
          value={draft}
          onChange={setDraft}
          onSave={() => saveQuestion(false)}
          onAddAnother={() => saveQuestion(true)}
        />
      </div>

      {submitting ? (
        <p className="mt-2 text-xs text-[#94A3B8]">جاري الحفظ...</p>
      ) : null}
    </div>
  )
}

export default ExamManualQuestionsPanel
