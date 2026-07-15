import { useTranslation } from 'react-i18next'
import { Building2, GraduationCap, Pencil } from 'lucide-react'
import SettingsCard from './SettingsCard'

function SettingsInstitutionCard({ workspace, loading = false }) {
  const { t } = useTranslation('settings')
  const workspaceName = workspace?.name?.trim() || '—'
  const logoUrl = workspace?.logo_url
  const description = workspace?.description?.trim() || t('institution.noDescription')

  const institutionType = (() => {
    if (workspace?.institution_type?.trim()) return workspace.institution_type.trim()
    if (workspace?.type?.trim()) return workspace.type.trim()
    if (workspace?.kind === 'INSTITUTION') return t('institution.defaultType')
    return '—'
  })()

  return (
    <SettingsCard title={t('institution.title')} icon={Building2}>
      <p className="-mt-2 mb-5 text-xs leading-6 text-[var(--shell-text-muted)]">
        {t('institution.description')}
      </p>

      <div className="relative mb-6 inline-flex">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-24 w-24 rounded-2xl object-cover ring-1 ring-[var(--shell-border)]"
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--shell-input-bg)] text-[var(--shell-text-muted)] ring-1 ring-[var(--shell-border)]">
            <GraduationCap className="h-10 w-10" strokeWidth={1.8} />
          </span>
        )}
        <span className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--shell-surface)] text-[var(--shell-text-muted)] ring-1 ring-[var(--shell-border)]">
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">{t('institution.name')}</p>
          <p className="text-sm font-semibold text-[var(--shell-text)]">
            {loading && !workspaceName ? '...' : workspaceName}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">{t('institution.type')}</p>
          <p className="text-sm font-semibold text-[var(--shell-text)]">
            {loading ? '...' : institutionType}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">
            {t('institution.descriptionLabel')}
          </p>
          <p className="text-sm leading-7 text-[var(--shell-text)]">
            {loading && !workspace?.description ? '...' : description}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-[var(--shell-accent)] opacity-60"
      >
        <Pencil className="h-4 w-4" />
        {t('institution.edit')}
      </button>
    </SettingsCard>
  )
}

export default SettingsInstitutionCard
