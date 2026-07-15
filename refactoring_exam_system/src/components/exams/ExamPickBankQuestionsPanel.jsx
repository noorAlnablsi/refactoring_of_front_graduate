import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, Plus, Search } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import { showAppToast } from '../../lib/appToast'
import { getQuestionBankQuestions } from '../../services/questionBanks.service'
import { addQuestionsFromBank } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'HARD') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (difficulty === 'EASY') return 'bg-[#F1F5F9] text-[#64748B]'
  return 'bg-[#FEF3C7] text-[#D97706]'
}

function SelectableBankQuestionCard({ question, selected, onToggle, t, choiceLetters }) {
  const choices = Array.isArray(question.choices) ? question.choices : []
  const points = question.points ?? 0
  const isTrueFalse = question.type_code === 'TRUE_FALSE'
  const topicName =
    question?.topic_name ||
    question?.topic?.name ||
    question?.topic_title ||
    question?.topic_label ||
    t('wizard.pickBank.noTopic')

  return (
    <article
      className={`rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)] ring-1 transition ${
        selected ? 'ring-2 ring-[#2AA8A2]' : 'ring-[#EEF2F4]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center justify-start gap-2">
          <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            {topicName}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyBadgeClass(question.difficulty)}`}
          >
            {t('wizard.pickBank.difficulty')} {t(`difficulty.${question.difficulty}`, { defaultValue: question.difficulty })}
          </span>
          <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#2563EB]">
            {t(`questionTypes.${question.type_code}`, { defaultValue: question.type_code })}
          </span>
          <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            {points}{' '}
            {points === 1 ? t('wizard.questions.review.points') : t('wizard.questions.review.pointsPlural')}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
            selected
              ? 'border-[#2AA8A2] bg-[#2AA8A2] text-white'
              : 'border-[#CBD5E1] bg-white text-transparent'
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>

      <div
        className="mt-5 text-base font-extrabold leading-8 text-[#2A3433]"
        dangerouslySetInnerHTML={{ __html: question.body || '' }}
      />

      {choices.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {choices.map((choice, choiceIndex) => {
            const letter = choiceLetters[choiceIndex] || String(choiceIndex + 1)
            const isCorrect = Boolean(choice.is_correct)

            return (
              <li
                key={choice.id || `${question.id}-${choiceIndex}`}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                  isCorrect
                    ? 'bg-[#E8F7F6] text-[#2AA8A2] ring-1 ring-[#CFECE9]'
                    : 'bg-[#F6F8F9] text-[#64748B]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {!isTrueFalse ? (
                    <span className="text-xs font-bold text-[#94A3B8]">{letter})</span>
                  ) : null}
                  <span dangerouslySetInnerHTML={{ __html: choice.body || choice.text || '' }} />
                </span>
                {isCorrect ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </article>
  )
}

function ExamPickBankQuestionsPanel({
  bank,
  test,
  testId,
  initialSelectedIds = [],
  onBack,
  onSaveDraft,
  onSuccess,
  savingDraft = false,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [questions, setQuestions] = useState([])
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const choiceLetters = useMemo(() => t('choiceLetters', { returnObjects: true }), [t])

  useEffect(() => {
    if (!bank?.id) return undefined

    let cancelled = false
    setLoading(true)

    getQuestionBankQuestions(bank.id)
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.questions || [])
          setSelectedIds(initialSelectedIds)
        }
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bank?.id, initialSelectedIds, showToast])

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return questions

    return questions.filter((question) => {
      const body = (question.body || '').replace(/<[^>]+>/g, ' ').toLowerCase()
      return body.includes(query)
    })
  }, [questions, search])

  const selectedQuestions = useMemo(
    () => questions.filter((question) => selectedIds.includes(question.id)),
    [questions, selectedIds],
  )

  const totalSelectedPoints = useMemo(
    () => selectedQuestions.reduce((sum, question) => sum + (Number(question.points) || 0), 0),
    [selectedQuestions],
  )

  const toggleQuestion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleAllVisible = () => {
    const visibleIds = filteredQuestions.map((question) => question.id)
    const allSelected = visibleIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])])
  }

  const handleSubmit = async () => {
    if (!selectedIds.length) {
      showAppToast('wizard.pickBank.minOneError', 'error', { ns: 'exams' })
      return
    }

    setSubmitting(true)
    try {
      await addQuestionsFromBank(testId, {
        bank_id: bank.id,
        question_ids: selectedIds,
      })
      showAppToast('wizard.pickBank.added', 'success', { ns: 'exams', count: selectedIds.length })
      onSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const examName = test?.title || test?.name || t('wizard.pickBank.defaultExamName')

  return (
    <div className="space-y-6 pb-4">
      <header className="text-right">
        <p className="text-sm font-semibold text-[#94A3B8]">
          {t('wizard.pickBank.breadcrumb')} <span className="mx-1">›</span> {bank.title}
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
              {bank.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
              {t('wizard.pickBank.subtitle', { name: examName })}
            </p>
          </div>
          <span className="rounded-full bg-[#E8F7F6] px-4 py-2 text-sm font-bold text-[#2AA8A2]">
            {t('wizard.pickBank.questionsCount', { count: questions.length })}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('wizard.pickBank.searchPlaceholder')}
            className="w-full rounded-xl bg-white py-3 pr-11 pl-4 text-sm text-[#374151] outline-none ring-1 ring-[#E5E9EB] focus:ring-2 focus:ring-[#2AA8A2]/30"
          />
        </div>

        {filteredQuestions.length > 0 ? (
          <button
            type="button"
            onClick={toggleAllVisible}
            className="text-sm font-bold text-[#2AA8A2]"
          >
            {filteredQuestions.every((question) => selectedIds.includes(question.id))
              ? t('wizard.pickBank.deselectAllVisible')
              : t('wizard.pickBank.selectAllVisible')}
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
          <p className="text-sm text-[#94A3B8]">{t('wizard.pickBank.loading')}</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
          <p className="text-sm text-[#94A3B8]">
            {questions.length === 0 ? t('wizard.pickBank.emptyBank') : t('wizard.pickBank.emptySearch')}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQuestions.map((question) => (
            <SelectableBankQuestionCard
              key={question.id}
              question={question}
              selected={selectedIds.includes(question.id)}
              onToggle={() => toggleQuestion(question.id)}
              t={t}
              choiceLetters={choiceLetters}
            />
          ))}
        </div>
      )}

      <ExamWizardFooter className="-mx-1 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('wizard.questions.review.back')}
          </button>

          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#374151]">
            <span>{t('wizard.pickBank.selectedCount', { count: selectedIds.length })}</span>
            <span className="text-[#94A3B8]">·</span>
            <span>{t('wizard.pickBank.totalPoints', { count: totalSelectedPoints })}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onSaveDraft?.(selectedIds)}
              disabled={savingDraft || !onSaveDraft}
              className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selectedIds.length}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? t('wizard.pickBank.adding') : t('wizard.pickBank.addToExam')}
            </button>
          </div>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamPickBankQuestionsPanel
