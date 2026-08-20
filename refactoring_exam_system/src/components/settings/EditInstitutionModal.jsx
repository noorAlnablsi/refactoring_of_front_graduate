import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, GraduationCap, X } from 'lucide-react'
import { useEditInstitution } from '../../hooks/useEditInstitution'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp'

function EditInstitutionModalContent({ mode, workspace, onClose, onSuccess }) {
  const { t } = useTranslation(['settings', 'common'])
  const fileInputRef = useRef(null)
  const isLogoOnly = mode === 'logo'
  const {
    name,
    setName,
    description,
    setDescription,
    logoUrl,
    saving,
    uploadingLogo,
    error,
    uploadLogo,
    clearLogo,
    save,
  } = useEditInstitution({
    open: true,
    workspace,
    mode,
    onSuccess,
  })

  const busy = saving || uploadingLogo

  const handleSubmit = async (event) => {
    event.preventDefault()
    const ok = await save()
    if (ok) onClose()
  }

  return (
    <div className={shellModalOverlayClass} role="dialog" aria-modal="true">
      <div dir="rtl" className={`max-w-lg ${shellModalPanelClass}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-xl ${shellPageTitleClass}`}>
            {isLogoOnly ? t('institution.edit.logoTitle') : t('institution.edit.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-[var(--shell-text-subtle)] transition hover:text-[var(--shell-text)]"
            aria-label={t('actions.close', { ns: 'common' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mb-5 text-sm ${shellBodyTextClass}`}>
          {isLogoOnly ? t('institution.edit.logoDescription') : t('institution.edit.description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative inline-flex">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[var(--shell-border)]"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--shell-input-bg)] text-[var(--shell-text-muted)] ring-1 ring-[var(--shell-border)]">
                  <GraduationCap className="h-10 w-10" strokeWidth={1.8} />
                </span>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -start-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-accent)] shadow-sm ring-1 ring-[var(--shell-border)] transition hover:bg-[var(--shell-hover)] disabled:opacity-60"
                aria-label={t('institution.edit.changeLogo')}
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="sr-only"
                disabled={busy}
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    try {
                      await uploadLogo(file)
                    } catch {

                    }
                  }
                  event.target.value = ''
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="text-xs text-[var(--shell-text-subtle)]">
                {uploadingLogo ? t('institution.edit.uploadingLogo') : t('institution.edit.logoHint')}
              </p>
              {logoUrl ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={clearLogo}
                  className="text-xs font-bold text-[var(--shell-danger-text)] disabled:opacity-60"
                >
                  {t('institution.edit.removeLogo')}
                </button>
              ) : null}
            </div>
          </div>

          {!isLogoOnly ? (
            <>
              <label className="block text-start">
                <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                  {t('institution.name')}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={busy}
                  className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
                  autoComplete="organization"
                />
              </label>

              <label className="block text-start">
                <span className={`mb-2 block text-sm font-semibold ${shellBodyTextClass}`}>
                  {t('institution.descriptionLabel')}
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={busy}
                  rows={4}
                  placeholder={t('institution.edit.descriptionPlaceholder')}
                  className={`w-full resize-y px-4 py-3 text-sm ${shellInputClass}`}
                />
              </label>
            </>
          ) : null}

          {error ? (
            <p className="text-sm font-semibold text-[var(--shell-danger-text)]">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-sm font-bold text-[var(--shell-accent)]"
            >
              {t('actions.cancel', { ns: 'common' })}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[var(--shell-accent)] px-6 py-3 text-sm font-bold text-[var(--shell-accent-contrast)] disabled:opacity-70"
            >
              {saving ? t('institution.edit.saving') : t('institution.edit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditInstitutionModal({ open, mode = 'full', workspace, onClose, onSuccess }) {
  if (!open) return null

  return (
    <EditInstitutionModalContent
      mode={mode}
      workspace={workspace}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default EditInstitutionModal
