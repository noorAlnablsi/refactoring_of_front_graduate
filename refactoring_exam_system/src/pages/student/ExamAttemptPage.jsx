import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AttemptExamHeader,
  AttemptFooter,
  AttemptSidebar,
} from '../../components/student/attempt/AttemptChrome'
import {
  AttemptSequentialFooter,
  AttemptSequentialHeader,
  AttemptSequentialProgress,
  AttemptSequentialSessionCard,
  AttemptSequentialWarning,
} from '../../components/student/attempt/AttemptSequentialChrome'
import AttemptQuestionRenderer from '../../components/student/attempt/AttemptQuestionRenderer'
import AttemptSubmitConfirmDialog from '../../components/student/attempt/AttemptSubmitConfirmDialog'
import ProctoringWarning from '../../components/proctoring/ProctoringWarning'
import CameraPreview from '../../components/proctoring/CameraPreview'
import { ROUTES } from '../../constants/routes'
import { getUnansweredQuestionIds, isAnswerProvided } from '../../lib/attemptAnswers'
import { useExamAttempt } from '../../hooks/student/useExamAttempt'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'

function ExamAttemptPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('student')
  const showToast = useToastStore((s) => s.showToast)
  const authUser = useAuthStore((s) => s.user)
  const [navHint, setNavHint] = useState('')
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

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
    markedIds,
    updateChoiceAnswer,
    updateEssayAnswer,
    toggleMarkForReview,
    goNext,
    goPrevious,
    goToIndex,
    submit,
    retry,
  } = useExamAttempt(testId)

  const studentName = authUser?.full_name || authUser?.name || ''
  const studentAvatarUrl = authUser?.avatar_url || ''
  const studentNumber =
    authUser?.student_number || authUser?.university_id || authUser?.student_id || null
  const subjectName = test?.subject?.name || test?.subject_name || ''

  const proctoringActive = proctoringRequired && proctoring.running

  /** Free navigation UI (sidebar + marks). Sequential locked UI when back nav is off. */
  const isFreeNavigation = navSettings.allowBackNavigation

  const isMarkedCurrent = useMemo(() => {
    if (!currentQuestion) return false
    return markedIds.has(currentQuestion.test_question_id)
  }, [currentQuestion, markedIds])

  const answeredCount = useMemo(
    () =>
      questions.filter((q) =>
        isAnswerProvided(answersMap[q.test_question_id], q.snapshot_type_code),
      ).length,
    [questions, answersMap],
  )

  useEffect(() => {
    if (!proctoring.warning) return
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

  const runSubmit = async () => {
    try {
      const result = await submit()
      if (!result) return

      setSubmitDialogOpen(false)

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
      if (err?.message === 'MARKED_REMAINING') {
        showToast(t('attempt.markedRemaining', { count: err.markedCount || markedIds.size }), 'error')
        setNavHint(t('attempt.markedRemaining', { count: err.markedCount || markedIds.size }))
        setSubmitDialogOpen(false)
        return
      }
      if (err?.message === 'ANSWER_ALL_REQUIRED') {
        showToast(t('attempt.requireAllAnswers'), 'error')
        setNavHint(t('attempt.requireAllAnswers'))
        setSubmitDialogOpen(false)
        return
      }
      showToast(err?.message || t('attempt.submitError'), 'error')
    }
  }

  const handleSubmitRequest = () => {
    if (isFreeNavigation && markedIds.size > 0) {
      showToast(t('attempt.markedRemaining', { count: markedIds.size }), 'error')
      setNavHint(t('attempt.markedRemaining', { count: markedIds.size }))
      return
    }

    if (!navSettings.allowSkipQuestions || navSettings.requireAnswerAll) {
      const current = currentQuestion
      if (current && !isAnswerProvided(answersMap[current.test_question_id], current.snapshot_type_code)) {
        showToast(t('attempt.answerRequired'), 'error')
        setNavHint(t('attempt.answerRequired'))
        return
      }
    }

    if (navSettings.requireAnswerAll) {
      const missing = getUnansweredQuestionIds(answersMap, questions)
      if (missing.length) {
        const message = t('attempt.requireAllAnswersRemaining', {
          count: missing.length,
          defaultValue: t('attempt.requireAllAnswers'),
        })
        showToast(message, 'error')
        setNavHint(message)

        const firstMissingIndex = questions.findIndex((q) =>
          missing.includes(q.test_question_id),
        )
        if (isFreeNavigation && firstMissingIndex >= 0) {
          goToIndex(firstMissingIndex)
        }
        return
      }
    }

    setSubmitDialogOpen(true)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8F9] px-4" data-a11y-scale-root>
        <p className="text-sm font-semibold text-[#64748B]">{t('attempt.loading')}</p>
      </main>
    )
  }

  if (error && !questions.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8F9] px-4" data-a11y-scale-root>
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

  const alerts = (
    <>
      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      {navHint ? (
        <p className="mb-4 rounded-xl bg-[#FFF7ED] px-4 py-3 text-sm font-semibold text-[#C2410C]">
          {navHint}
        </p>
      ) : null}
      {proctoring.error ? (
        <p className="mb-4 rounded-xl bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
          {t('attempt.proctoringError')}: {proctoring.error}
        </p>
      ) : null}
    </>
  )

  if (!isFreeNavigation) {
    return (
      <main className="min-h-screen bg-[#F6F8F9]" data-a11y-scale-root>
        <ProctoringWarning warning={proctoring.warning} onDismiss={proctoring.clearWarning} />

        <AttemptSequentialHeader
          examTitle={test?.name || test?.title}
          remainingSeconds={remainingSeconds}
        />

        <AttemptSequentialProgress
          currentIndex={currentIndex}
          total={questions.length}
          answeredCount={answeredCount}
        />

        <AttemptSequentialWarning />

        <AttemptSequentialSessionCard
          studentName={studentName}
          studentAvatarUrl={studentAvatarUrl}
          studentNumber={studentNumber}
          remainingSeconds={remainingSeconds}
          proctoringActive={proctoringActive}
        />

        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          {alerts}
          {proctoringRequired && proctoring.cameraStream ? (
            <div className="mb-4 overflow-hidden rounded-xl ring-1 ring-[#E5E9EB] lg:hidden">
              <CameraPreview stream={proctoring.cameraStream} className="h-24 w-full object-cover" />
            </div>
          ) : null}
        </div>

        <AttemptQuestionRenderer
          question={currentQuestion}
          answer={currentQuestion ? answersMap[currentQuestion.test_question_id] : null}
          questionIndex={currentIndex}
          questionTotal={questions.length}
          marked={false}
          disabled={submitting}
          variant="sequential"
          subjectName={subjectName}
          onSelectChoice={updateChoiceAnswer}
          onEssayChange={updateEssayAnswer}
        />

        <AttemptSequentialFooter
          isLast={currentIndex >= questions.length - 1}
          submitting={submitting}
          onNext={handleNext}
          onSubmit={handleSubmitRequest}
        />

        <AttemptSubmitConfirmDialog
          open={submitDialogOpen}
          loading={submitting}
          onClose={() => setSubmitDialogOpen(false)}
          onConfirm={runSubmit}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F8F9]" data-a11y-scale-root>
      <ProctoringWarning warning={proctoring.warning} onDismiss={proctoring.clearWarning} />

      <AttemptExamHeader
        examTitle={test?.name || test?.title}
        subjectName={subjectName}
        studentName={studentName}
        studentAvatarUrl={studentAvatarUrl}
        proctoringActive={proctoringActive}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <AttemptSidebar
          remainingSeconds={remainingSeconds}
          questions={questions}
          answersMap={answersMap}
          markedIds={markedIds}
          currentIndex={currentIndex}
          allowBack={navSettings.allowBackNavigation}
          saving={saving}
          submitting={submitting}
          onSelect={handleSelectIndex}
          onSubmitClick={handleSubmitRequest}
        />

        <section className="min-w-0">
          {alerts}

          {proctoringRequired && proctoring.cameraStream ? (
            <div className="mb-4 overflow-hidden rounded-xl ring-1 ring-[#E5E9EB] lg:hidden">
              <CameraPreview stream={proctoring.cameraStream} className="h-24 w-full object-cover" />
            </div>
          ) : null}

          <AttemptQuestionRenderer
            question={currentQuestion}
            answer={currentQuestion ? answersMap[currentQuestion.test_question_id] : null}
            questionIndex={currentIndex}
            questionTotal={questions.length}
            marked={isMarkedCurrent}
            disabled={submitting}
            onToggleMark={toggleMarkForReview}
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
            onSubmit={handleSubmitRequest}
          />
        </section>
      </div>

      <AttemptSubmitConfirmDialog
        open={submitDialogOpen}
        loading={submitting}
        onClose={() => setSubmitDialogOpen(false)}
        onConfirm={runSubmit}
      />
    </main>
  )
}

export default ExamAttemptPage
