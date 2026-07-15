import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, ClipboardList, Trash2 } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import { showAppToast } from '../../lib/appToast'
import { removeTestQuestion, updateTestQuestion } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'HARD') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (difficulty === 'EASY') return 'bg-[#F1F5F9] text-[#64748B]'
  return 'bg-[#FEF3C7] text-[#D97706]'
}

function GeneratedQuestionCard({ question, index, testId, onRemoved, onUpdated, t, choiceLetters }) {
  const showToast = useToastStore((s) => s.showToast)
  const [removing, setRemoving] = useState(false)
  const [points, setPoints] = useState(question.snapshot_points ?? question.points ?? 0)
  const [difficulty, setDifficulty] = useState(question.snapshot_difficulty || question.difficulty || 'EASY')
  const [saving, setSaving] = useState(false)

  const topicName =
    question.snapshot_topic_name || question.topic_name || t('wizard.questions.review.noTopic')
  const choices = Array.isArray(question.snapshot_choices)
    ? question.snapshot_choices
    : Array.isArray(question.choices)
      ? question.choices
      : []
  const isTrueFalse = (question.snapshot_type_code || question.type_code) === 'TRUE_FALSE'
  const questionText = question.snapshot_question_text || question.body || ''
  const questionId = question.id

  const handleRemove = async () => {
    if (!testId || !questionId) return
    if (!window.confirm(t('wizard.questions.review.deleteConfirm'))) return

    setRemoving(true)
    try {
      await removeTestQuestion(testId, questionId)
      showAppToast('wizard.questions.review.questionDeleted', 'success', { ns: 'exams' })
      onRemoved?.(questionId)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setRemoving(false)
    }
  }

  const handleSaveMeta = async () => {
    if (!testId || !questionId) return
    setSaving(true)
    try {
      const data = await updateTestQuestion(testId, questionId, {
        points: Number(points) || 1,
        difficulty,
      })
      showAppToast('wizard.questions.review.questionUpdated', 'success', { ns: 'exams' })
      onUpdated?.(data.question || data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)] ring-1 ring-[#EEF2F4]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-start gap-2">
          <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            {topicName}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyBadgeClass(difficulty)}`}>
            {t('wizard.questions.review.difficulty')} {t(`difficulty.${difficulty}`, { defaultValue: difficulty })}
          </span>
          <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            {points}{' '}
            {Number(points) === 1
              ? t('wizard.questions.review.points')
              : t('wizard.questions.review.pointsPlural')}
          </span>
        </div>

        {testId && questionId ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {removing ? t('wizard.questions.review.deleting') : t('wizard.questions.review.deleteQuestion')}
          </button>
        ) : null}
      </div>

      <div
        className="mt-5 text-base font-extrabold leading-8 text-[#2A3433]"
        dangerouslySetInnerHTML={{ __html: questionText }}
      />

      {choices.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {choices.map((choice, choiceIndex) => {
            const letter = choiceLetters[choiceIndex] || String(choiceIndex + 1)
            const isCorrect = Boolean(choice.is_correct)

            return (
              <li
                key={choice.id || `${index}-${choiceIndex}`}
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

      {testId && questionId ? (
        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-[#EEF2F4] pt-4">
          <label className="text-right text-xs">
            <span className="mb-1 block font-semibold text-[#94A3B8]">
              {t('wizard.questions.review.pointsLabel')}
            </span>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="h-10 w-24 rounded-lg bg-[#F6F8F9] px-3 text-sm font-bold outline-none ring-1 ring-[#E5E9EB]"
            />
          </label>
          <label className="text-right text-xs">
            <span className="mb-1 block font-semibold text-[#94A3B8]">
              {t('wizard.questions.review.difficultyLabel')}
            </span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-10 rounded-lg bg-[#F6F8F9] px-3 text-sm font-bold outline-none ring-1 ring-[#E5E9EB]"
            >
              <option value="EASY">{t('difficulty.EASY')}</option>
              <option value="MEDIUM">{t('difficulty.MEDIUM')}</option>
              <option value="HARD">{t('difficulty.HARD')}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleSaveMeta}
            disabled={saving}
            className="h-10 rounded-lg bg-[#E8F7F6] px-4 text-xs font-bold text-[#2AA8A2] disabled:opacity-60"
          >
            {saving ? t('wizard.questions.review.savingEdit') : t('wizard.questions.review.saveEdit')}
          </button>
        </div>
      ) : null}
    </article>
  )
}

function ExamRandomGeneratedQuestionsPanel({
  questions: initialQuestions,
  testId,
  onBack,
  onSaveDraft,
  onContinue,
  onQuestionsChange,
  savingDraft = false,
  embedded = false,
  continueLabel,
  eyebrow,
  title,
  description,
  sectionTitle,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const [questions, setQuestions] = useState(initialQuestions || [])

  const choiceLetters = useMemo(() => t('choiceLetters', { returnObjects: true }), [t])

  const resolvedContinueLabel = continueLabel ?? t('wizard.questions.nextSettings')
  const resolvedEyebrow = eyebrow ?? t('wizard.questions.reviewSources.random.eyebrow')
  const resolvedTitle = title ?? t('wizard.questions.reviewSources.random.title')
  const resolvedDescription = description ?? t('wizard.questions.reviewSources.random.description')
  const resolvedSectionTitle = sectionTitle ?? t('wizard.questions.reviewSources.random.sectionTitle')

  useEffect(() => {
    setQuestions(initialQuestions || [])
  }, [initialQuestions])

  const handleRemoved = (questionId) => {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== questionId)
      onQuestionsChange?.(next)
      return next
    })
  }

  const handleUpdated = (updated) => {
    if (!updated?.id) return
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)))
  }

  return (
    <div className={`space-y-8 ${embedded ? 'pb-4' : 'pb-4'}`}>
      {!embedded ? (
        <header className="text-right">
          <p className="text-sm font-bold text-[#2AA8A2]">{resolvedEyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
            {resolvedTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B] md:text-[15px]">
            {resolvedDescription}
          </p>
        </header>
      ) : null}

      <div>
        <div className="mb-5 flex items-center justify-start gap-2">
          <ClipboardList className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} />
          <h3 className="text-base font-extrabold text-[#2A3433] md:text-lg">{resolvedSectionTitle}</h3>
          <span className="mr-2 rounded-full bg-[#E8F7F6] px-2.5 py-0.5 text-xs font-bold text-[#2AA8A2]">
            {questions.length}
          </span>
        </div>

        <div className="space-y-5">
          {questions.map((question, index) => (
            <GeneratedQuestionCard
              key={question.id || index}
              question={question}
              index={index}
              testId={testId}
              onRemoved={handleRemoved}
              onUpdated={handleUpdated}
              t={t}
              choiceLetters={choiceLetters}
            />
          ))}
        </div>
      </div>

      <ExamWizardFooter className="-mx-1 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B] transition hover:bg-[#EEF2F3]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('wizard.questions.review.back')}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft || !onSaveDraft}
              className="text-sm font-bold text-[#64748B] transition hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={questions.length < 1}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] transition hover:opacity-95 disabled:opacity-60"
            >
              {resolvedContinueLabel}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamRandomGeneratedQuestionsPanel
