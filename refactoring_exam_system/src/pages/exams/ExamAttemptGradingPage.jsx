import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, Eye, FileEdit, Shield } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { GRADING_WIZARD_STEPS } from '../../lib/grading/attemptGradingModel'
import { useExamAttemptGrading } from '../../hooks/exams/useExamAttemptGrading'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

const STEPS = [
  { id: GRADING_WIZARD_STEPS.AUTO, icon: Eye, key: 'auto' },
  { id: GRADING_WIZARD_STEPS.MANUAL, icon: FileEdit, key: 'manual' },
  { id: GRADING_WIZARD_STEPS.PROCTORING, icon: Shield, key: 'proctoring' },
  { id: GRADING_WIZARD_STEPS.FINAL, icon: CheckCircle2, key: 'final' },
]

function QuestionBlock({ question, children }) {
  const text = question.snapshot_question_text || question.body || '—'
  const points = question.points ?? question.snapshot_points ?? 0
  return (
    <article className={`p-5 ${shellCardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#2AA8A2]">
          #{question.test_question_id} · {question.snapshot_type_code || '—'}
        </p>
        <p className="text-xs font-bold text-[#64748B]">{formatLocaleNumber(points)} pts</p>
      </div>
      <div
        className="mt-3 text-sm font-bold leading-7 text-[#2A3433]"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {children}
    </article>
  )
}

function ExamAttemptGradingPage() {
  const { id: testId, attemptId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('exams')
  const grading = useExamAttemptGrading(testId, attemptId)

  if (grading.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className={`text-sm ${shellSubtleTextClass}`}>{t('grading.wizard.loading')}</p>
      </div>
    )
  }

  if (!grading.attempt) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-red-600">{t('grading.wizard.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={shellPageEyebrowClass}>{t('grading.wizard.eyebrow')}</p>
          <h1 className={`mt-2 text-2xl ${shellPageTitleClass}`}>{t('grading.wizard.title')}</h1>
          <p className={`mt-2 ${shellBodyTextClass}`}>
            {t('grading.wizard.subtitle', {
              status: t(`grading.attemptStatus.${grading.attempt.status}`, {
                defaultValue: grading.attempt.status,
              }),
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EXAM_ATTEMPTS.replace(':id', testId))}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-4 py-2.5 text-sm font-bold text-[#64748B]"
        >
          <ArrowRight className="h-4 w-4" />
          {t('grading.wizard.backToAttempts')}
        </button>
      </header>

      <nav className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((item) => {
          const Icon = item.icon
          const active = grading.step === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => grading.setStep(item.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-right text-xs font-bold transition ${
                active
                  ? 'bg-[#2AA8A2] text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)]'
                  : 'bg-white text-[#64748B] ring-1 ring-[#E5E9EB]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(`grading.wizard.steps.${item.key}`)}
            </button>
          )
        })}
      </nav>

      {grading.step === GRADING_WIZARD_STEPS.AUTO ? (
        <section className="space-y-4">
          <p className={shellBodyTextClass}>{t('grading.auto.hint')}</p>
          {grading.autoQuestions.length === 0 ? (
            <p className={shellSubtleTextClass}>{t('grading.auto.empty')}</p>
          ) : (
            grading.autoQuestions.map((q) => (
              <QuestionBlock key={q.test_question_id} question={q}>
                <div className="mt-4 rounded-xl bg-[#F6F8F9] p-4 text-sm">
                  <p className="text-xs font-semibold text-[#94A3B8]">{t('grading.auto.earned')}</p>
                  <p className="mt-1 font-extrabold text-[#2AA8A2]">
                    {formatLocaleNumber(q.answer?.earned_score ?? 0)}
                  </p>
                  <p className="mt-2 text-xs text-[#64748B]">
                    {t(`grading.answerStatus.${q.answer?.grading_status}`, {
                      defaultValue: q.answer?.grading_status || '—',
                    })}
                  </p>
                </div>
              </QuestionBlock>
            ))
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={grading.goNextFromAuto}
              className={`${shellAccentButtonClass} px-6 py-3 text-sm`}
            >
              {t('grading.auto.next')}
            </button>
          </div>
        </section>
      ) : null}

      {grading.step === GRADING_WIZARD_STEPS.MANUAL ? (
        <section className="space-y-4">
          <p className={shellBodyTextClass}>{t('grading.manual.hint')}</p>
          {grading.pendingQuestions.length === 0 ? (
            <p className={shellSubtleTextClass}>{t('grading.manual.empty')}</p>
          ) : (
            grading.pendingQuestions.map((q) => {
              const id = q.test_question_id
              return (
                <QuestionBlock key={id} question={q}>
                  {q.answer?.answer_text ? (
                    <div className="mt-4 rounded-xl bg-[#F8FDFC] p-4 text-sm leading-7 text-[#374151] ring-1 ring-[#CFECE9]">
                      {q.answer.answer_text}
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-[#94A3B8]">
                      {t('grading.manual.scoreLabel')}
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={grading.manualScores[id] ?? ''}
                        onChange={(e) =>
                          grading.setManualScores((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-3 text-sm font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2]"
                      />
                    </label>
                    <label className="text-xs font-semibold text-[#94A3B8]">
                      {t('grading.manual.feedbackLabel')}
                      <input
                        type="text"
                        value={grading.manualFeedback[id] ?? ''}
                        onChange={(e) =>
                          grading.setManualFeedback((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-3 text-sm font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2]"
                      />
                    </label>
                  </div>
                </QuestionBlock>
              )
            })
          )}
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => grading.setStep(GRADING_WIZARD_STEPS.AUTO)}
              className="rounded-xl bg-[#F6F8F9] px-5 py-3 text-sm font-bold text-[#64748B]"
            >
              {t('grading.wizard.back')}
            </button>
            <button
              type="button"
              disabled={grading.saving || grading.pendingQuestions.length === 0}
              onClick={grading.saveManual}
              className={`${shellAccentButtonClass} px-6 py-3 text-sm disabled:opacity-60`}
            >
              {grading.saving ? t('grading.manual.saving') : t('grading.manual.saveNext')}
            </button>
          </div>
        </section>
      ) : null}

      {grading.step === GRADING_WIZARD_STEPS.PROCTORING ? (
        <section className="space-y-4">
          <p className={shellBodyTextClass}>{t('grading.proctoring.hint')}</p>
          {grading.reviewError ? (
            <div className={`p-5 ${shellCardClass}`}>
              <p className="text-sm font-bold text-[#B45309]">{t('grading.proctoring.unavailable')}</p>
              <p className={`mt-2 text-xs ${shellSubtleTextClass}`}>{grading.reviewError}</p>
            </div>
          ) : null}
          {grading.review ? (
            <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-5 ${shellCardClass}`}>
              <Stat label={t('grading.proctoring.raw')} value={grading.review.raw_score} />
              <Stat label={t('grading.proctoring.penalty')} value={grading.review.penalty} />
              <Stat
                label={t('grading.proctoring.suggested')}
                value={grading.review.suggested_final_score}
                highlight
              />
              <Stat
                label={t('grading.proctoring.risk')}
                value={`${formatLocaleNumber(grading.review.proctoring?.risk_percentage ?? 0)}%`}
              />
            </div>
          ) : !grading.reviewError ? (
            <p className={shellSubtleTextClass}>{t('grading.proctoring.loading')}</p>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => grading.setStep(GRADING_WIZARD_STEPS.MANUAL)}
              className="rounded-xl bg-[#F6F8F9] px-5 py-3 text-sm font-bold text-[#64748B]"
            >
              {t('grading.wizard.back')}
            </button>
            <button
              type="button"
              onClick={grading.goNextFromProctoring}
              className={`${shellAccentButtonClass} px-6 py-3 text-sm`}
            >
              {t('grading.proctoring.next')}
            </button>
          </div>
        </section>
      ) : null}

      {grading.step === GRADING_WIZARD_STEPS.FINAL ? (
        <section className={`space-y-5 p-6 ${shellCardClass}`}>
          <p className={shellBodyTextClass}>{t('grading.final.hint')}</p>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              checked={grading.approveSuggested}
              onChange={() => grading.setApproveSuggested(true)}
              className="accent-[#2AA8A2]"
            />
            <span className="text-sm font-bold text-[#2A3433]">
              {t('grading.final.approveSuggested', {
                score: formatLocaleNumber(
                  grading.review?.suggested_final_score ?? grading.attempt.raw_score ?? 0,
                ),
              })}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              checked={!grading.approveSuggested}
              onChange={() => grading.setApproveSuggested(false)}
              className="accent-[#2AA8A2]"
            />
            <span className="text-sm font-bold text-[#2A3433]">{t('grading.final.customScore')}</span>
          </label>
          {!grading.approveSuggested ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#94A3B8]">
                {t('grading.final.scoreLabel')}
                <input
                  type="number"
                  min={0}
                  value={grading.finalScoreInput}
                  onChange={(e) => grading.setFinalScoreInput(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-3 text-sm font-bold outline-none focus:border-[#2AA8A2]"
                />
              </label>
              <label className="text-xs font-semibold text-[#94A3B8]">
                {t('grading.final.reasonLabel')}
                <input
                  type="text"
                  value={grading.finalReason}
                  onChange={(e) => grading.setFinalReason(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-3 text-sm font-bold outline-none focus:border-[#2AA8A2]"
                />
              </label>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => grading.setStep(GRADING_WIZARD_STEPS.PROCTORING)}
              className="rounded-xl bg-[#F6F8F9] px-5 py-3 text-sm font-bold text-[#64748B]"
            >
              {t('grading.wizard.back')}
            </button>
            <button
              type="button"
              disabled={grading.saving || String(grading.attempt.status).toUpperCase() === 'GRADED'}
              onClick={grading.submitFinal}
              className={`${shellAccentButtonClass} px-6 py-3 text-sm disabled:opacity-60`}
            >
              {grading.saving ? t('grading.final.saving') : t('grading.final.confirm')}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-[#F6F8F9] p-4">
      <p className="text-xs font-semibold text-[#94A3B8]">{label}</p>
      <p className={`mt-1 text-sm font-extrabold ${highlight ? 'text-[#2AA8A2]' : 'text-[#2A3433]'}`}>
        {typeof value === 'number' ? formatLocaleNumber(value) : value ?? '—'}
      </p>
    </div>
  )
}

export default ExamAttemptGradingPage
