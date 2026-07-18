import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AttemptFooter,
  AttemptNavigator,
  AttemptTopBar,
} from '../../components/student/attempt/AttemptChrome'
import AttemptQuestionRenderer from '../../components/student/attempt/AttemptQuestionRenderer'
import ProctoringWarning from '../../components/proctoring/ProctoringWarning'
import { ROUTES } from '../../constants/routes'
import { useExamAttempt } from '../../hooks/student/useExamAttempt'
import { useToastStore } from '../../store/toastStore'

function ExamAttemptPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('student')
  const showToast = useToastStore((s) => s.showToast)
  const [navHint, setNavHint] = useState('')

  const {
    loading,
    error,
    test,
    questions,
    answersMap,
    currentIndex,
    currentQuestion,
    remainingSeconds,
    saving,
    submitting,
    navSettings,
    proctoringRequired,
    proctoring,
    updateChoiceAnswer,
    updateEssayAnswer,
    goNext,
    goPrevious,
    goToIndex,
    submit,
    retry,
  } = useExamAttempt(testId)

  useEffect(() => {
    if (!proctoring.warning) return
    // Keep overlay via ProctoringWarning; also surface as toast for LOW.
  }, [proctoring.warning])

  const handleNext = () => {
    const result = goNext()
    if (!result.ok && result.reason === 'answer_required') {
      setNavHint(t('attempt.answerRequired'))
      showToast(t('attempt.answerRequired'), 'error')
      return
    }
    setNavHint('')
  }

  const handlePrevious = () => {
    const result = goPrevious()
    if (!result.ok && result.reason === 'back_disabled') {
      setNavHint(t('attempt.backDisabled'))
      return
    }
    setNavHint('')
  }

  const handleSelectIndex = (index) => {
    const result = goToIndex(index)
    if (!result.ok) {
      if (result.reason === 'answer_required') {
        setNavHint(t('attempt.answerRequired'))
        showToast(t('attempt.answerRequired'), 'error')
      } else if (result.reason === 'back_disabled') {
        setNavHint(t('attempt.backDisabled'))
      }
      return
    }
    setNavHint('')
  }

  const handleSubmit = async () => {
    try {
      const result = await submit()
      if (!result) return

      if (result.redirect.pathKey === 'pending') {
        navigate(ROUTES.STUDENT_RESULTS_PENDING, {
          replace: true,
          state: { submit: result.data, testId },
        })
        return
      }

      navigate(ROUTES.STUDENT_RESULTS, {
        replace: true,
        state: { submit: result.data, testId },
      })
    } catch (err) {
      if (err?.message === 'ANSWER_ALL_REQUIRED') {
        showToast(t('attempt.requireAllAnswers'), 'error')
        setNavHint(t('attempt.requireAllAnswers'))
        return
      }
      showToast(err?.message || t('attempt.submitError'), 'error')
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8F9] px-4">
        <p className="text-sm font-semibold text-[#64748B]">{t('attempt.loading')}</p>
      </main>
    )
  }

  if (error && !questions.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8F9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-[#E5E9EB]">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry?.()}
              className="rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white"
            >
              {t('attempt.retry')}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
              className="rounded-xl bg-[#F1F5F9] px-5 py-2.5 text-sm font-bold text-[#64748B]"
            >
              {t('attempt.backToDashboard')}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F8F9] pb-10">
      <ProctoringWarning
        warning={proctoring.warning}
        onDismiss={proctoring.clearWarning}
      />

      <AttemptTopBar
        examTitle={test?.name || test?.title}
        questionIndex={currentIndex}
        questionTotal={questions.length}
        remainingSeconds={remainingSeconds}
        saving={saving}
        submitting={submitting}
        proctoringRequired={proctoringRequired}
        cameraStream={proctoring.cameraStream}
      />

      <div className="mx-auto mt-6 w-full max-w-6xl space-y-5 px-4 md:px-6">
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
        ) : null}

        {navHint ? (
          <p className="rounded-xl bg-[#FFF7ED] px-4 py-3 text-sm font-semibold text-[#C2410C]">
            {navHint}
          </p>
        ) : null}

        {proctoring.error ? (
          <p className="rounded-xl bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
            {t('attempt.proctoringError')}: {proctoring.error}
          </p>
        ) : null}

        <AttemptNavigator
          questions={questions}
          answersMap={answersMap}
          currentIndex={currentIndex}
          allowBack={navSettings.allowBackNavigation}
          onSelect={handleSelectIndex}
        />

        <AttemptQuestionRenderer
          question={currentQuestion}
          answer={currentQuestion ? answersMap[currentQuestion.test_question_id] : null}
          disabled={submitting}
          onSelectChoice={updateChoiceAnswer}
          onEssayChange={updateEssayAnswer}
        />

        <AttemptFooter
          allowBack={navSettings.allowBackNavigation}
          isFirst={currentIndex === 0}
          isLast={currentIndex >= questions.length - 1}
          submitting={submitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}

export default ExamAttemptPage
