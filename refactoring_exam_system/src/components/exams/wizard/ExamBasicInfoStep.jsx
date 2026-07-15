import { useEffect, useState } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSubjects } from '../../../services/subjects.service'
import { buildTestStep1Payload } from '../../../lib/testPayload'
import { isInstitutionWorkspace } from '../../../lib/workspaceContext'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/40'

function ExamBasicInfoStep({
  initialValues,
  onSubmit,
  onSaveDraft,
  onDraftChange,
  submitting,
  savingDraft,
}) {
  const { t } = useTranslation(['exams', 'forms', 'common'])
  const showSubjectField = isInstitutionWorkspace()
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
    if (showSubjectField && !form.subject_id) {
      nextErrors.subject_id = t('validation.subjectRequired', { ns: 'exams' })
    }
    if (!form.duration_minutes || Number(form.duration_minutes) < 1) {
      nextErrors.duration_minutes = t('validation.durationRequired', { ns: 'exams' })
    }
    if (!form.total_score || Number(form.total_score) < 1) {
      nextErrors.total_score = t('validation.totalScoreRequired', { ns: 'exams' })
    }
    if (form.passing_score === '' || Number(form.passing_score) < 0) {
      nextErrors.passing_score = t('validation.passingScoreRequired', { ns: 'exams' })
    }
    if (Number(form.passing_score) > Number(form.total_score)) {
      nextErrors.passing_score = t('validation.passingScoreExceedsTotal', { ns: 'exams' })
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = () => buildTestStep1Payload(form)

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
    onSaveDraft?.(buildPayload())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
      <div>
        <h2 className="text-xl font-extrabold text-[#2A3433]">{t('wizard.basicInfo.title', { ns: 'exams' })}</h2>
        <p className="mt-1 text-sm text-[#64748B]">{t('wizard.basicInfo.subtitle', { ns: 'exams' })}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[#374151]">
          {t('wizard.basicInfo.nameLabel', { ns: 'exams' })}
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder={t('wizard.basicInfo.namePlaceholder', { ns: 'exams' })}
          className={inputClassName}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-[#374151]">
          {t('wizard.basicInfo.descriptionLabel', { ns: 'exams' })}
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder={t('wizard.basicInfo.descriptionPlaceholder', { ns: 'exams' })}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('wizard.basicInfo.subjectLabel', { ns: 'exams' })}
          </label>
          <select
            required={showSubjectField}
            value={form.subject_id}
            onChange={(e) => setField('subject_id', e.target.value)}
            className={inputClassName}
          >
            <option value="">{t('wizard.basicInfo.subjectPlaceholder', { ns: 'exams' })}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {!showSubjectField ? (
            <p className="mt-1 text-xs text-[#94A3B8]">
              {t('wizard.basicInfo.subjectOptionalHint', { ns: 'exams' })}
            </p>
          ) : null}
          {errors.subject_id ? <p className="mt-1 text-xs text-red-600">{errors.subject_id}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('wizard.basicInfo.durationLabel', { ns: 'exams' })}
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              required
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('wizard.basicInfo.totalScoreLabel', { ns: 'exams' })}
          </label>
          <input
            type="number"
            min={1}
            required
            value={form.total_score}
            onChange={(e) => setField('total_score', e.target.value)}
            className={inputClassName}
          />
          {errors.total_score ? <p className="mt-1 text-xs text-red-600">{errors.total_score}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#374151]">
            {t('wizard.basicInfo.passingScoreLabel', { ns: 'exams' })}
          </label>
          <input
            type="number"
            min={0}
            required
            value={form.passing_score}
            onChange={(e) => setField('passing_score', e.target.value)}
            className={inputClassName}
          />
          {errors.passing_score ? (
            <p className="mt-1 text-xs text-red-600">{errors.passing_score}</p>
          ) : null}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F6F8F9] px-4 py-3">
        <input
          type="checkbox"
          checked={form.auto_distribute_scores}
          onChange={(e) => setField('auto_distribute_scores', e.target.checked)}
          className="h-5 w-5 accent-[#2AA8A2]"
        />
        <span className="text-sm font-bold text-[#374151]">
          {t('wizard.basicInfo.autoDistribute', { ns: 'exams' })}
        </span>
      </label>

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
