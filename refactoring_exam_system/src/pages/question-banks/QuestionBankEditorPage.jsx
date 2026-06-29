import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Eye } from 'lucide-react'
import BankInfoSummary from '../../components/question-banks/editor/BankInfoSummary'
import EditQuestionModal from '../../components/question-banks/editor/EditQuestionModal'
import QuestionsLoadErrorBanner from '../../components/question-banks/editor/QuestionsLoadErrorBanner'
import PreviewQuestionsModal from '../../components/question-banks/editor/PreviewQuestionsModal'
import PublishQuestionBankModal from '../../components/question-banks/editor/PublishQuestionBankModal'
import QuestionBuilderForm from '../../components/question-banks/editor/QuestionBuilderForm'
import QuestionsList from '../../components/question-banks/editor/QuestionsList'
import { parseApiError } from '../../lib/apiError'
import { ROUTES } from '../../constants/routes'
import { canAccessQuestionBanks, canManageQuestionBank, isQuestionBankOwner } from '../../lib/workspaceContext'
import { isRichTextEmpty } from '../../lib/richText'
import {
  getQuestionBanksListPath,
  QUESTION_BANK_TABS,
  validateQuestionChoiceRules,
} from '../../lib/questionBanks'
import {
  createQuestionBankQuestions,
  findQuestionBankById,
  loadQuestionBankQuestionsForView,
  updateQuestionInBank,
  updateQuestionBank,
} from '../../services/questionBanks.service'
import { getSubjectTopics } from '../../services/subjects.service'
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
  if (Array.isArray(payload.items)) return payload.items

  return []
}

function QuestionBankEditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const showToast = useToastStore((s) => s.showToast)
  const sourceTab = location.state?.sourceTab || QUESTION_BANK_TABS.MY
  const banksListPath = getQuestionBanksListPath(sourceTab)
  const [bank, setBank] = useState(() => {
    const stateBank = location.state?.bank
    return stateBank && String(stateBank.id) === String(id) ? stateBank : null
  })
  const [serverQuestions, setServerQuestions] = useState([])
  const [localQuestions, setLocalQuestions] = useState([])
  const [draftQuestion, setDraftQuestion] = useState(createDefaultQuestion())
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishVisibility, setPublishVisibility] = useState('PRIVATE')
  const [publishing, setPublishing] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [updatingQuestion, setUpdatingQuestion] = useState(false)
  const [topics, setTopics] = useState([])
  const [questionsLoadError, setQuestionsLoadError] = useState(null)

  const canEditBank = bank
    ? sourceTab === QUESTION_BANK_TABS.COMMUNITY
      ? isQuestionBankOwner(bank)
      : canManageQuestionBank(bank)
    : false
  const readOnly = bank ? !canEditBank : sourceTab === QUESTION_BANK_TABS.COMMUNITY

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      try {
        const stateBank = location.state?.bank
        const selectedBank =
          stateBank && String(stateBank.id) === String(id)
            ? stateBank
            : await findQuestionBankById(id, sourceTab)

        if (cancelled) return

        if (!selectedBank) {
          showToast('بنك الأسئلة غير موجود', 'error')
          navigate(banksListPath, { replace: true })
          return
        }

        setBank(selectedBank)
        setPublishVisibility(selectedBank.visibility || 'PRIVATE')
        setQuestionsLoadError(null)

        const isCommunityViewer =
          sourceTab === QUESTION_BANK_TABS.COMMUNITY && !isQuestionBankOwner(selectedBank)

        try {
          const questionsData = await loadQuestionBankQuestionsForView(id, { bank: selectedBank })
          if (!cancelled) {
            setServerQuestions(questionsData.questions || [])
          }
        } catch (questionsError) {
          if (cancelled) return

          const message = parseApiError(questionsError)
          const status = questionsError?.status ?? questionsError?.response?.status

          if (isCommunityViewer) {
            setServerQuestions([])
            setQuestionsLoadError({ message, status })
            showToast(message, 'error')
          } else {
            throw questionsError
          }
        }

        if (selectedBank.subject_id) {
          getSubjectTopics(selectedBank.subject_id)
            .then((topicsData) => {
              if (cancelled) return
              setTopics(extractTopicsList(topicsData))
            })
            .catch(() => {
              if (cancelled) return
              setTopics([])
            })
        } else {
          setTopics([])
        }
      } catch (err) {
        if (cancelled) return
        showToast(err.message, 'error')
        navigate(banksListPath, { replace: true })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [banksListPath, id, location.state?.bank, navigate, showToast, sourceTab])

  const allQuestions = useMemo(() => [...serverQuestions, ...localQuestions], [serverQuestions, localQuestions])

  if (!canAccessQuestionBanks()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const validateDraftQuestion = () => {
    if (isRichTextEmpty(draftQuestion.body)) {
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
      const choiceError = validateQuestionChoiceRules(draftQuestion.type_code, draftQuestion.choices)
      if (choiceError) {
        showToast(choiceError, 'error')
        return false
      }
    }
    if (topics.length > 0 && !draftQuestion.topic_id) {
      showToast('اختر المحور للسؤال', 'error')
      return false
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
      navigate(banksListPath)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  const handleUpdateQuestion = async (payload) => {
    if (!bank || !editingQuestion?.id) return
    setUpdatingQuestion(true)
    try {
      const result = await updateQuestionInBank(bank.id, editingQuestion.id, payload)
      const updatedQuestion = result?.question || { ...editingQuestion, ...payload }
      setServerQuestions((prev) =>
        prev.map((question) => (String(question.id) === String(editingQuestion.id) ? updatedQuestion : question)),
      )
      setEditingQuestion(null)
      showToast('تم تعديل السؤال بنجاح')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setUpdatingQuestion(false)
    }
  }

  if (loading || !bank) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  return (
    <div className="space-y-6">
      <BankInfoSummary bank={bank} />

      {!readOnly ? (
        <QuestionBuilderForm
          value={draftQuestion}
          onChange={setDraftQuestion}
          onSave={handleSaveQuestion}
          onAddAnother={handleAddAnother}
          topics={topics}
        />
      ) : null}

      <QuestionsLoadErrorBanner bankId={id} error={questionsLoadError} />

      <QuestionsList
        questions={allQuestions}
        readOnly={readOnly}
        topics={topics}
        canEdit={!readOnly}
        onEditQuestion={setEditingQuestion}
        emptyMessage={
          questionsLoadError
            ? 'لم يتم تحميل الأسئلة بسبب خطأ من الخادم.'
            : readOnly && sourceTab === QUESTION_BANK_TABS.COMMUNITY
              ? 'لا توجد أسئلة في هذا البنك.'
              : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#EEF2F3] px-6 py-3 text-sm font-bold text-[#374151]"
        >
          <Eye className="h-4 w-4" />
          معاينة الأسئلة
        </button>
        {!readOnly ? (
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white"
          >
            رفع بنك الأسئلة
          </button>
        ) : null}
      </div>

      <PreviewQuestionsModal
        open={previewOpen}
        questions={allQuestions}
        topics={topics}
        onClose={() => setPreviewOpen(false)}
      />
      <EditQuestionModal
        open={Boolean(editingQuestion)}
        question={editingQuestion}
        topics={topics}
        submitting={updatingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSubmit={handleUpdateQuestion}
      />
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
