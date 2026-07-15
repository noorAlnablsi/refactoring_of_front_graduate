import { useTranslation } from 'react-i18next'
import { Camera, X } from 'lucide-react'

const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp'

function CreateWorkspaceLogoField({
  preview,
  onChange,
  onClear,
  disabled = false,
  label,
  uploadLabel,
}) {
  const { t } = useTranslation(['settings', 'forms'])
  const resolvedLabel = label || t('createWorkspace.logoLabelInstitution')
  const resolvedUploadLabel = uploadLabel || t('createWorkspace.uploadLogoInstitution')

  return (
    <div className="space-y-2">
      <span className="block text-sm font-bold text-[#374151]">{resolvedLabel}</span>

      {preview ? (
        <div className="relative inline-flex">
          <img
            src={preview}
            alt={t('createWorkspace.logoPreviewAlt')}
            className="h-28 w-28 rounded-2xl object-cover ring-1 ring-[#E5E7EB]"
          />
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#6B7280] shadow ring-1 ring-[#E5E7EB] transition hover:text-red-500"
            aria-label={t('createWorkspace.removeLogoAria')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFB] text-center transition hover:bg-[#F1F5F6] ${
            disabled ? 'cursor-not-allowed opacity-60' : ''
          }`}
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #D1D5DB 1px, transparent 0)',
              backgroundSize: '12px 12px',
            }}
          />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F7F6] text-[#2AA8A2]">
            <Camera className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="relative text-xs font-bold text-[#2AA8A2]">{resolvedUploadLabel}</span>
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            disabled={disabled}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onChange(file)
              event.target.value = ''
            }}
          />
        </label>
      )}
    </div>
  )
}

export default CreateWorkspaceLogoField
