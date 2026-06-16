import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Eye } from 'lucide-react'
import BankInfoSummary from '../../components/question-banks/editor/BankInfoSummary'
import PreviewQuestionsModal from '../../components/question-banks/editor/PreviewQuestionsModal'
import PublishQuestionBankModal from '../../components/question-banks/editor/PublishQuestionBankModal'
import QuestionBuilderForm from '../../components/question-banks/editor/QuestionBuilderForm'
import QuestionsList from '../../components/question-banks/editor/QuestionsList'
import TopicsPlaceholder from '../../components/question-banks/editor/TopicsPlaceholder'
import { ROUTES } from '../../constants/routes'
import { canAccessQuestionBanks } from '../../lib/workspaceContext'
import { createQuestionBankQuestions, getMyQuestionBanks, getQuestionBankQuestions, updateQuestionBank } from '../../services/questionBanks.service'
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

function QuestionBankEditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const showToast = useToastStore((s) => s.showToast)
  const [bank, setBank] = useState(() => location.state?.bank || null)
  const [serverQuestions, setServerQuestions] = useState([])
  const [localQuestions, setLocalQuestions] = useState([])
  const [draftQuestion, setDraftQuestion] = useState(createDefaultQuestion())
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishVisibility, setPublishVisibility] = useState('PRIVATE')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([getMyQuestionBanks(), getQuestionBankQuestions(id)])
      .then(([banksData, questionsData]) => {
        if (cancelled) return
        const selectedBank = (banksData.question_banks || []).find((item) => String(item.id) === String(id))
        if (!selectedBank) {
          showToast('لا يمكن الوصول إلى بنك الأسئلة', 'error')
          navigate(ROUTES.QUESTION_BANKS, { replace: true })
          return
        }
        setBank(selectedBank)
        setPublishVisibility(selectedBank.visibility || 'PRIVATE')
        setServerQuestions(questionsData.questions || [])
      })
      .catch((err) => {
        if (cancelled) return
        showToast(err.message, 'error')
        navigate(ROUTES.QUESTION_BANKS, { replace: true })
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, navigate, showToast])

  const allQuestions = useMemo(() => [...serverQuestions, ...localQuestions], [serverQuestions, localQuestions])

  if (!canAccessQuestionBanks()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const validateDraftQuestion = () => {
    if (!draftQuestion.body.trim()) {
      showToast('نص السؤال مطلوب', 'error')
      return false
    }
    if (!draftQuestion.points || Number(draftQuestion.points) < 1) {
      showToast('العلامة يجب أن تكون أكبر من 0', 'error')
      return false
    }
    if (draftQuestion.type_code !== 'ESSAY') {
      if (!draftQuestion.choices.length) {
        showToast('أضف خيارات للإجابة', 'error')
        return false
      }
      const hasEmptyChoice = draftQuestion.choices.some((choice) => !choice.body.trim())
      if (hasEmptyChoice) {
        showToast('جميع الخيارات يجب أن تكون مكتملة', 'error')
        return false
      }
      const correctCount = draftQuestion.choices.filter((choice) => choice.is_correct).length
      if (correctCount === 0) {
        showToast('حدد إجابة صحيحة واحدة على الأقل', 'error')
        return false
      }
    }
    return true
  }

  const handleSaveQuestion = () => {
    if (!validateDraftQuestion()) return
    setLocalQuestions((prev) => [...prev, normalizeQuestionForApi(draftQuestion)])
    showToast('تم حفظ السؤال محلياً')
  }

  const handleAddAnother = () => {
    setDraftQuestion(createDefaultQuestion())
  }

  const handlePublish = async () => {
    if (!bank) return
    if (!localQuestions.length) {
      showToast('أضف سؤالاً واحداً على الأقل قبل النشر', 'error')
      return
    }
    setPublishing(true)
    try {
      await updateQuestionBank(bank.id, { visibility: publishVisibility })
      await createQuestionBankQuestions(bank.id, localQuestions)
      showToast('Question Bank Published Successfully')
      navigate(ROUTES.QUESTION_BANKS)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  if (loading || !bank) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  return (
    <div className="space-y-6">
      <BankInfoSummary bank={bank} />
      <TopicsPlaceholder />

      <QuestionBuilderForm
        value={draftQuestion}
        onChange={setDraftQuestion}
        onSave={handleSaveQuestion}
        onAddAnother={handleAddAnother}
      />

      <QuestionsList questions={allQuestions} />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#EEF2F3] px-6 py-3 text-sm font-bold text-[#374151]"
        >
          <Eye className="h-4 w-4" />
          معاينة الأسئلة
        </button>
        <button
          type="button"
          onClick={() => setPublishOpen(true)}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white"
        >
          رفع بنك الأسئلة
        </button>
      </div>

      <PreviewQuestionsModal open={previewOpen} questions={allQuestions} onClose={() => setPreviewOpen(false)} />
      <PublishQuestionBankModal
        open={publishOpen}
        visibility={publishVisibility}
        loading={publishing}
        onChangeVisibility={setPublishVisibility}
        onClose={() => setPublishOpen(false)}
        onPublish={handlePublish}
      />
    </div>
  )
}

export default QuestionBankEditorPage
