import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, Loader2, Save, Send } from 'lucide-react'
import ConfirmActionDialog from '../../components/common/ConfirmActionDialog'
import SurveyRespondQuestionCard from '../../components/surveys/respond/SurveyRespondQuestionCard'
import { ROUTES } from '../../constants/routes'
import { useSurveyRespond } from '../../hooks/surveys/useSurveyRespond'
import { showAppToast } from '../../lib/appToast'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getSurveyAudienceScope } from '../../lib/surveys'
import {
  canAccessDashboard,
  canAccessStudentDashboard,
} from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellGhostButtonClass,
  shellPageEyebrowClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'
import { useToastStore } from '../../store/toastStore'

function SurveyRespondPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['surveys', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [submitOpen, setSubmitOpen] = useState(false)

  const {
    loading,
    error,
    survey,
    questions,
    response,
    answersMap,
    phase,
    starting,
    saving,
    submitting,
    dirty,
    answeredCount,
    reload,
    startOrResume,
    updateChoiceAnswer,
    updateEssayAnswer,
    saveNow,
    submit,
  } = useSurveyRespond(id)

  const backPath = useMemo(() => {
    if (canAccessDashboard()) return ROUTES.SURVEYS
    if (canAccessStudentDashboard()) return ROUTES.STUDENT_DASHBOARD
    return ROUTES.HOME
  }, [])

  const audience = getSurveyAudienceScope(survey)
  const readOnly = phase === 'completed'
  const unansweredCount = Math.max(questions.length - answeredCount, 0)

  const handleStart = async () => {
    try {
      await startOrResume()
      showAppToast('respond.toast.started', 'success', { ns: 'surveys' })
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSave = async () => {
    try {
      const saved = await saveNow()
      if (!saved) {
        showAppToast('respond.toast.nothingToSave', 'error', { ns: 'surveys' })
        return
      }
      showAppToast('respond.toast.saved', 'success', { ns: 'surveys' })
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSubmit = async () => {
    try {
      await submit()
      setSubmitOpen(false)
      showAppToast('respond.toast.submitted', 'success', { ns: 'surveys' })
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--shell-bg)] px-4">
        <div className={`w-full max-w-lg p-8 text-center ${shellCardClass}`}>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--shell-accent)]" />
          <p className={`mt-4 ${shellPageSubtitleClass}`}>{t('respond.loading')}</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--shell-bg)] px-4">
        <div className={`w-full max-w-lg p-8 text-center ${shellCardClass}`}>
          <p className={`text-lg ${shellPageTitleClass}`}>{t('respond.loadErrorTitle')}</p>
          <p className={`mt-2 text-sm text-red-500`}>{error}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={reload} className={shellAccentButtonClass}>
              {t('actions.retry', { ns: 'common' })}
            </button>
            <Link to={backPath} className={shellGhostButtonClass}>
              {t('respond.back')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--shell-bg)]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className={`inline-flex items-center gap-2 ${shellGhostButtonClass}`}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t('respond.back')}
          </button>
          {saving ? (
            <span className={`inline-flex items-center gap-2 ${shellSubtleTextClass}`}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('respond.saving')}
            </span>
          ) : dirty ? (
            <span className={shellSubtleTextClass}>{t('respond.unsaved')}</span>
          ) : phase === 'answering' ? (
            <span className={shellSubtleTextClass}>{t('respond.savedHint')}</span>
          ) : null}
        </div>

        <header className={`p-6 ${shellCardClass}`}>
          <p className={shellPageEyebrowClass}>{t('respond.eyebrow')}</p>
          <h1 className={`mt-1 text-2xl sm:text-3xl ${shellPageTitleClass}`}>
            {survey?.name || t('card.untitled')}
          </h1>
          {survey?.description ? (
            <p className={`mt-3 ${shellPageSubtitleClass}`}>{survey.description}</p>
          ) : null}
          <div className={`mt-4 flex flex-wrap gap-3 text-xs font-semibold ${shellSubtleTextClass}`}>
            <span>{t(`audience.${audience.toLowerCase()}`)}</span>
            {phase === 'answering' ? (
              <>
                <span>•</span>
                <span>
                  {t('respond.progress', {
                    answered: formatLocaleNumber(answeredCount),
                    total: formatLocaleNumber(questions.length),
                  })}
                </span>
              </>
            ) : null}
          </div>
        </header>

        {phase === 'completed' ? (
          <div className={`flex items-start gap-3 p-5 ${shellCardClass}`}>
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--shell-accent)]" />
            <div>
              <p className={`text-base ${shellPageTitleClass}`}>{t('respond.completedTitle')}</p>
              <p className={`mt-1 ${shellBodyTextClass}`}>{t('respond.completedMessage')}</p>
            </div>
          </div>
        ) : null}

        {phase === 'intro' ? (
          <div className={`p-6 text-center ${shellCardClass}`}>
            <p className={`text-lg ${shellPageTitleClass}`}>{t('respond.introTitle')}</p>
            <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('respond.introMessage')}</p>
            <button
              type="button"
              onClick={handleStart}
              disabled={starting}
              className={`mt-6 ${shellAccentButtonClass} disabled:opacity-70`}
            >
              {starting ? t('respond.starting') : t('respond.start')}
            </button>
          </div>
        ) : null}

        {phase === 'answering' && questions.length ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <SurveyRespondQuestionCard
                key={question.test_question_id}
                question={question}
                index={index}
                answer={answersMap[question.test_question_id]}
                disabled={readOnly || submitting}
                onSelectChoice={updateChoiceAnswer}
                onChangeEssay={updateEssayAnswer}
              />
            ))}
          </div>
        ) : null}

        {phase === 'answering' ? (
          <div className={`sticky bottom-4 flex flex-wrap items-center justify-end gap-3 p-4 ${shellCardClass}`}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || submitting}
              className={`${shellGhostButtonClass} inline-flex items-center gap-2 disabled:opacity-70`}
            >
              <Save className="h-4 w-4" />
              {t('respond.save')}
            </button>
            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
              disabled={submitting || !response?.response_id}
              className={`${shellAccentButtonClass} disabled:opacity-70`}
            >
              <Send className="h-4 w-4" />
              {t('respond.submit')}
            </button>
          </div>
        ) : null}

        {error && survey ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      <ConfirmActionDialog
        open={submitOpen}
        title={t('respond.submitTitle')}
        message={
          unansweredCount > 0
            ? t('respond.submitMessagePartial', { count: formatLocaleNumber(unansweredCount) })
            : t('respond.submitMessage')
        }
        note={t('respond.submitNote')}
        confirmLabel={t('respond.submit')}
        loadingLabel={t('respond.submitting')}
        confirmTone="accent"
        loading={submitting}
        onClose={() => {
          if (!submitting) setSubmitOpen(false)
        }}
        onConfirm={handleSubmit}
      />
    </div>
  )
}

export default SurveyRespondPage
