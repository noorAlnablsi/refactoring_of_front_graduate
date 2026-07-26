import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, ChevronDown, X } from 'lucide-react'
import { REPORT_CATEGORY_OPTIONS } from '../../constants/reports'
import { useCreateReport } from '../../hooks/useCreateReport'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

function CreateReportModal({ open, onClose }) {
  const { t, i18n } = useTranslation(['settings', 'common'])
  const {
    category,
    setCategory,
    title,
    setTitle,
    description,
    setDescription,
    fieldErrors,
    setFieldErrors,
    submitting,
    error,
    reset,
    submit,
  } = useCreateReport({
    onSuccess: () => onClose?.(),
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    await submit()
  }

  return (
    <div className={shellModalOverlayClass} role="dialog" aria-modal="true" aria-labelledby="create-report-title">
      <div
        dir={i18n.dir()}
        className={`max-w-lg ${shellModalPanelClass}`}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 id="create-report-title" className={`text-xl text-[var(--shell-accent)] ${shellPageTitleClass}`}>
            {t('report.modalTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[var(--shell-text-subtle)] transition hover:text-[var(--shell-text)] disabled:opacity-60"
            aria-label={t('actions.close', { ns: 'common' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-6 text-sm leading-7 ${shellBodyTextClass}`}>{t('report.modalSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <label className="block text-start">
            <span className="mb-2 block text-sm font-bold text-[var(--shell-text)]">
              {t('report.categoryLabel')}
            </span>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, category: undefined }))
                }}
                disabled={submitting}
                className={`w-full appearance-none ${shellInputClass} px-4 py-3 pe-10 text-sm font-semibold ${
                  fieldErrors.category ? 'ring-1 ring-[#DC2626]' : ''
                }`}
              >
                <option value="">{t('report.categoryPlaceholder')}</option>
                {REPORT_CATEGORY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`report.categories.${value}`)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
            </div>
            <FieldError message={fieldErrors.category} />
          </label>

          <label className="block text-start">
            <span className="mb-2 block text-sm font-bold text-[var(--shell-text)]">
              {t('report.titleLabel')}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setFieldErrors((prev) => ({ ...prev, title: undefined }))
              }}
              disabled={submitting}
              placeholder={t('report.titlePlaceholder')}
              className={`w-full ${shellInputClass} px-4 py-3 text-sm font-semibold ${
                fieldErrors.title ? 'ring-1 ring-[#DC2626]' : ''
              }`}
            />
            <FieldError message={fieldErrors.title} />
          </label>

          <label className="block text-start">
            <span className="mb-2 block text-sm font-bold text-[var(--shell-text)]">
              {t('report.descriptionLabel')}
            </span>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setFieldErrors((prev) => ({ ...prev, description: undefined }))
              }}
              disabled={submitting}
              rows={5}
              placeholder={t('report.descriptionPlaceholder')}
              className={`w-full resize-y ${shellInputClass} px-4 py-3 text-sm leading-7 ${
                fieldErrors.description ? 'ring-1 ring-[#DC2626]' : ''
              }`}
            />
            <p className="mt-2 text-xs leading-6 text-[var(--shell-text-subtle)]">
              {t('report.descriptionHint')}
            </p>
            <FieldError message={fieldErrors.description} />
          </label>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-start gap-4 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className={`${shellAccentButtonClass} disabled:opacity-60`}
            >
              {submitting ? t('report.submitting') : t('report.submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-sm font-bold text-[var(--shell-accent)] transition hover:brightness-95 disabled:opacity-60"
            >
              {t('report.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReportModal
