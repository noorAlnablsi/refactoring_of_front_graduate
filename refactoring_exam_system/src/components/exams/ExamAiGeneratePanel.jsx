import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, Sparkles, Trash2 } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import { showAppToast } from '../../lib/appToast'
import {
  deleteAiGeneratedQuestion,
  generateAiQuestions,
  getAiGenerationRequest,
  importAiQuestions,
} from '../../services/tests.service'
import { getSubjectTopics } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'

function ExamAiGeneratePanel({ test, testId, onBack, onSuccess, onSaveDraft, savingDraft = false }) {
  const { t } = useTranslation(['exams', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [topics, setTopics] = useState([])
  const [selectedTopicIds, setSelectedTopicIds] = useState([])
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('EASY')
  const [typeCode, setTypeCode] = useState('MCQ')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [requestId, setRequestId] = useState(null)
  const [generated, setGenerated] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

  const typeOptions = useMemo(
    () => ['MCQ', 'TRUE_FALSE', 'MULTI_SELECT', 'ESSAY'].map((value) => ({
      value,
      label: t(`questionTypes.${value}`),
    })),
    [t],
  )

  const difficultyOptions = useMemo(
    () => ['EASY', 'MEDIUM', 'HARD'].map((value) => ({
      value,
      label: t(`difficulty.${value}`),
    })),
    [t],
  )

  useEffect(() => {
    let cancelled = false

    async function loadTopics() {
      if (!test?.subject_id) return
      try {
        const data = await getSubjectTopics(test.subject_id)
        if (cancelled) return
        const list = data.topics || []
        setTopics(list)
        setSelectedTopicIds(list.map((topic) => topic.id))
      } catch (err) {
        if (!cancelled) showToast(err.message, 'error')
      }
    }

    loadTopics()
    return () => {
      cancelled = true
    }
  }, [test?.subject_id, showToast])

  const toggleTopic = (topicId) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId],
    )
  }

  const toggleQuestion = (questionId) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    )
  }

  const handleGenerate = async () => {
    if (!selectedTopicIds.length) {
      showAppToast('wizard.ai.selectTopicsError', 'error', { ns: 'exams' })
      return
    }

    setLoading(true)
    try {
      const data = await generateAiQuestions(testId, {
        topic_ids: selectedTopicIds,
        count: Number(count) || 5,
        difficulty,
        type_code: typeCode,
        learning_objectives: [],
        additional_instructions: instructions.trim() || '',
      })

      const questions = data.generated_questions || []
      setRequestId(data.generation_request_id)
      setGenerated(questions)
      setSelectedIds(questions.map((q) => q.id))
      showAppToast('wizard.ai.generated', 'success', { ns: 'exams', count: questions.length })
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshRequest = async () => {
    if (!requestId) return
    setLoading(true)
    try {
      const data = await getAiGenerationRequest(requestId)
      const questions = data.generated_questions || []
      setGenerated(questions)
      setSelectedIds((prev) => prev.filter((id) => questions.some((q) => q.id === id)))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGenerated = async (questionId) => {
    try {
      await deleteAiGeneratedQuestion(questionId)
      setGenerated((prev) => prev.filter((q) => q.id !== questionId))
      setSelectedIds((prev) => prev.filter((id) => id !== questionId))
      showAppToast('wizard.ai.deleted', 'success', { ns: 'exams' })
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleImport = async () => {
    if (!requestId || !selectedIds.length) {
      showAppToast('wizard.ai.selectToImportError', 'error', { ns: 'exams' })
      return
    }

    setImporting(true)
    try {
      const data = await importAiQuestions(testId, {
        request_id: requestId,
        question_ids: selectedIds,
      })
      showAppToast('wizard.ai.imported', 'success', {
        ns: 'exams',
        count: data.count ?? selectedIds.length,
      })
      await onSuccess?.(data.questions || [])
      setSelectedIds([])
      setGenerated((prev) => prev.filter((q) => !selectedIds.includes(q.id)))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.ai.eyebrow')}</p>
        <h2 className="mt-2 text-[28px] font-extrabold text-[#2A3433]">{t('wizard.ai.title')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">{t('wizard.ai.subtitle')}</p>
      </header>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-right text-sm">
            <span className="mb-2 block font-semibold text-[#64748B]">{t('wizard.ai.countLabel')}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-11 w-full rounded-xl bg-[#F6F8F9] px-4 outline-none ring-1 ring-[#E5E9EB] focus:ring-[#2AA8A2]/40"
            />
          </label>
          <label className="text-right text-sm">
            <span className="mb-2 block font-semibold text-[#64748B]">{t('wizard.ai.difficultyLabel')}</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-11 w-full rounded-xl bg-[#F6F8F9] px-4 outline-none ring-1 ring-[#E5E9EB]"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-right text-sm">
            <span className="mb-2 block font-semibold text-[#64748B]">{t('wizard.ai.typeLabel')}</span>
            <select
              value={typeCode}
              onChange={(e) => setTypeCode(e.target.value)}
              className="h-11 w-full rounded-xl bg-[#F6F8F9] px-4 outline-none ring-1 ring-[#E5E9EB]"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-[#64748B]">{t('wizard.ai.topicsLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
              const checked = selectedTopicIds.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    checked
                      ? 'bg-[#E8F7F6] text-[#2AA8A2] ring-1 ring-[#2AA8A2]/25'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {topic.name}
                </button>
              )
            })}
          </div>
        </div>

        <label className="mt-5 block text-right text-sm">
          <span className="mb-2 block font-semibold text-[#64748B]">{t('wizard.ai.instructionsLabel')}</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-[#F6F8F9] px-4 py-3 outline-none ring-1 ring-[#E5E9EB]"
            placeholder={t('wizard.ai.instructionsPlaceholder')}
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? t('wizard.ai.generating') : t('wizard.ai.generate')}
          </button>
          {requestId ? (
            <button
              type="button"
              onClick={handleRefreshRequest}
              disabled={loading}
              className="rounded-xl bg-[#F6F8F9] px-5 py-3 text-sm font-bold text-[#64748B]"
            >
              {t('wizard.ai.refreshReview')}
            </button>
          ) : null}
        </div>
      </div>

      {generated.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#2A3433]">{t('wizard.ai.reviewTitle')}</h3>
          {generated.map((question) => {
            const checked = selectedIds.includes(question.id)
            const typeCodeLabel = question.type_code || question.snapshot_type_code
            const choices = Array.isArray(question.choices)
              ? question.choices
              : Array.isArray(question.snapshot_choices)
                ? question.snapshot_choices
                : []
            const isTrueFalse = typeCodeLabel === 'TRUE_FALSE'

            return (
              <article
                key={question.id}
                className={`rounded-2xl bg-white p-5 ring-1 ${
                  checked ? 'ring-[#2AA8A2]/35' : 'ring-[#E5E9EB]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => toggleQuestion(question.id)} className="w-full text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#E8F7F6] px-2.5 py-0.5 text-[11px] font-bold text-[#2AA8A2]">
                        {question.topic_name || t('wizard.ai.defaultTopic')}
                      </span>
                      <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-bold text-[#64748B]">
                        {t(`difficulty.${question.difficulty}`, { defaultValue: question.difficulty })}
                      </span>
                      {typeCodeLabel ? (
                        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-bold text-[#475569]">
                          {t(`questionTypes.${typeCodeLabel}`, { defaultValue: typeCodeLabel })}
                        </span>
                      ) : null}
                      {checked ? <Check className="h-4 w-4 text-[#2AA8A2]" /> : null}
                    </div>
                    <p className="mt-3 text-sm font-bold leading-7 text-[#2A3433]">
                      {question.question_text}
                    </p>
                    {choices.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-right">
                        {choices.map((choice, choiceIndex) => (
                          <li
                            key={choice.id || `${question.id}-${choiceIndex}`}
                            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                              choice.is_correct
                                ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                                : 'bg-[#F6F8F9] text-[#64748B]'
                            }`}
                          >
                            {!isTrueFalse ? (
                              <span className="me-1 text-[#94A3B8]">{String.fromCharCode(65 + choiceIndex)})</span>
                            ) : null}
                            {choice.choice_text || choice.text || choice.label || ''}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGenerated(question.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={t('wizard.ai.deleteAria')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

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
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft || !onSaveDraft}
            className="text-sm font-bold text-[#64748B] disabled:opacity-50"
          >
            {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !selectedIds.length}
            className="rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {importing
              ? t('wizard.ai.importing')
              : t('wizard.ai.importSelected', { count: selectedIds.length })}
          </button>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamAiGeneratePanel
