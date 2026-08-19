import { useEffect, useState } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SURVEY_AUDIENCE_SCOPE, TEST_KIND } from '../../../constants/tests'
import { getSubjects } from '../../../services/subjects.service'
import { buildSurveyStep1Payload, buildTestStep1Payload } from '../../../lib/testPayload'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function ExamBasicInfoStep({
  initialValues,
  onSubmit,
  onSaveDraft,
  onDraftChange,
  submitting,
  savingDraft,
  autoDistributeLocked = false,
  kind = TEST_KIND.EXAM,
}) {
  const { t } = useTranslation(['exams', 'surveys', 'forms', 'common'])
  const isSurvey = kind === TEST_KIND.SURVEY
  const [subjects, setSubjects] = useState([])
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    total_score: 100,
    passing_score: 60,
    auto_distribute_scores: true,
    audience_scope: SURVEY_AUDIENCE_SCOPE.WORKSPACE,
    ...initialValues,
  })

  useEffect(() => {
    let cancelled = false
    getSubjects()
      .then((data) => {
        if (cancelled) return
        setSubjects(data.subjects || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (initialValues) {
      setForm((prev) => ({
        ...prev,
        ...initialValues,
        subject_id: initialValues.subject_id ? String(initialValues.subject_id) : '',
      }))
    }
  }, [initialValues])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = t('validation.nameRequired', { ns: 'exams' })
    if (!isSurvey && !form.subject_id) {
      nextErrors.subject_id = t('validation.subjectRequired', { ns: 'exams' })
    }
    if (!isSurvey && (!form.duration_minutes || Number(form.duration_minutes) < 1)) {
      nextErrors.duration_minutes = t('validation.durationRequired', { ns: 'exams' })
    }
    if (form.auto_distribute_scores) {
      if (!form.total_score || Number(form.total_score) < 1) {
        nextErrors.total_score = t('validation.totalScoreRequired', { ns: 'exams' })
      }
      if (
        form.passing_score !== '' &&
        Number(form.passing_score) > Number(form.total_score)
      ) {
        nextErrors.passing_score = t('validation.passingScoreExceedsTotal', { ns: 'exams' })
      }
    }
    if (!isSurvey && (form.passing_score === '' || Number(form.passing_score) < 0)) {
      nextErrors.passing_score = t('validation.passingScoreRequired', { ns: 'exams' })
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = () => (isSurvey ? buildSurveyStep1Payload(form) : buildTestStep1Payload(form))

  useEffect(() => {
    onDraftChange?.(form)
  }, [form, onDraftChange])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    onSubmit(buildPayload())
  }

  const handleSaveDraft = () => {
    if (!form.name.trim()) {
      setErrors({ name: t('validation.nameRequiredForDraft', { ns: 'exams' }) })
      return
    }
    if (!isSurvey && !form.subject_id) {
      setErrors({ subject_id: t('validation.subjectRequired', { ns: 'exams' }) })
      return
    }
    onSaveDraft?.(buildPayload())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
      <div>
        <h2 className="text-xl font-extrabold text-[#2A3433]">
          {isSurvey
            ? t('wizard.basicInfo.title', { ns: 'surveys' })
            : t('wizard.basicInfo.title', { ns: 'exams' })}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isSurvey
            ? t('wizard.basicInfo.subtitle', { ns: 'surveys' })
            : t('wizard.basicInfo.subtitle', { ns: 'exams' })}
        </p>
      </div>

      <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {isSurvey
              ? t('wizard.basicInfo.nameLabel', { ns: 'surveys' })
              : t('wizard.basicInfo.nameLabel', { ns: 'exams' })}
          </label>
          <input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={
              isSurvey
                ? t('wizard.basicInfo.namePlaceholder', { ns: 'surveys' })
                : t('wizard.basicInfo.namePlaceholder', { ns: 'exams' })
            }
          className={inputClassName}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {isSurvey
              ? t('wizard.basicInfo.descriptionLabel', { ns: 'surveys' })
              : t('wizard.basicInfo.descriptionLabel', { ns: 'exams' })}
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={
              isSurvey
                ? t('wizard.basicInfo.descriptionPlaceholder', { ns: 'surveys' })
                : t('wizard.basicInfo.descriptionPlaceholder', { ns: 'exams' })
            }
          className={inputClassName}
        />
      </div>

      <div className={`grid gap-4 ${isSurvey ? '' : 'md:grid-cols-2'}`}>
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {isSurvey
              ? t('wizard.basicInfo.subjectLabel', { ns: 'surveys' })
              : t('wizard.basicInfo.subjectLabel', { ns: 'exams' })}
          </label>
          <select
            value={form.subject_id}
            onChange={(e) => setField('subject_id', e.target.value)}
            className={inputClassName}
          >
            {isSurvey ? (
              <option value="">{t('wizard.basicInfo.subjectOptional', { ns: 'surveys' })}</option>
            ) : (
              <option value="" disabled hidden>
                {t('wizard.basicInfo.subjectPlaceholder', { ns: 'exams' })}
              </option>
            )}
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {isSurvey ? (
            <p className="mt-2 text-xs leading-6 text-[#94A3B8]">
              {t('wizard.basicInfo.subjectHint', { ns: 'surveys' })}
            </p>
          ) : null}
          {errors.subject_id ? <p className="mt-1 text-xs text-red-600">{errors.subject_id}</p> : null}
        </div>

        {!isSurvey ? (
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">
              {t('wizard.basicInfo.durationLabel', { ns: 'exams' })}
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) => setField('duration_minutes', e.target.value)}
                className={`${inputClassName} pl-16`}
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#94A3B8]">
                {t('wizard.basicInfo.minutesUnit', { ns: 'exams' })}
              </span>
            </div>
            {errors.duration_minutes ? (
              <p className="mt-1 text-xs text-red-600">{errors.duration_minutes}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isSurvey ? (
        <>
          <label
            className={`flex items-center gap-3 rounded-xl bg-[#F6F8F9] px-4 py-3 ${
              autoDistributeLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={form.auto_distribute_scores}
              onChange={(e) => setField('auto_distribute_scores', e.target.checked)}
              disabled={autoDistributeLocked}
              className="h-5 w-5 accent-[#2AA8A2] disabled:cursor-not-allowed"
            />
            <span className="text-sm font-bold text-[#374151]">
              {t('wizard.basicInfo.autoDistribute', { ns: 'exams' })}
            </span>
          </label>

          {autoDistributeLocked ? (
            <p className="text-xs leading-6 text-[#94A3B8]">
              {t('wizard.basicInfo.autoDistributeLockedHint', { ns: 'exams' })}
            </p>
          ) : null}

          {!form.auto_distribute_scores ? (
            <p className="text-xs leading-6 text-[#94A3B8]">
              {t('wizard.basicInfo.manualScoresHint', { ns: 'exams' })}
            </p>
          ) : null}

          <div className={`grid gap-4 ${form.auto_distribute_scores ? 'md:grid-cols-2' : ''}`}>
            {form.auto_distribute_scores ? (
              <div>
                <label className="mb-2 block text-sm font-bold text-[#374151]">
                  {t('wizard.basicInfo.totalScoreLabel', { ns: 'exams' })}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.total_score}
                  onChange={(e) => setField('total_score', e.target.value)}
                  className={inputClassName}
                />
                {errors.total_score ? <p className="mt-1 text-xs text-red-600">{errors.total_score}</p> : null}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-bold text-[#374151]">
                {t('wizard.basicInfo.passingScoreLabel', { ns: 'exams' })}
              </label>
              <input
                type="number"
                min={0}
                value={form.passing_score}
                onChange={(e) => setField('passing_score', e.target.value)}
                className={inputClassName}
              />
              {errors.passing_score ? (
                <p className="mt-1 text-xs text-red-600">{errors.passing_score}</p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E9EB] pt-5">
        {onSaveDraft ? (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2AA8A2] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingDraft
              ? t('wizard.basicInfo.savingDraft', { ns: 'exams' })
              : t('wizard.basicInfo.saveDraft', { ns: 'exams' })}
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          data-keyboard-primary=""
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.2)] disabled:opacity-60"
        >
          {submitting
            ? t('wizard.basicInfo.saving', { ns: 'exams' })
            : t('wizard.basicInfo.continueToQuestions', { ns: 'exams' })}
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

export default ExamBasicInfoStep
