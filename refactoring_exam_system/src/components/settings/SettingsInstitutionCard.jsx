import { Building2, GraduationCap, Pencil } from 'lucide-react'
import { getInstitutionTypeLabel } from '../../lib/workspace'
import SettingsCard from './SettingsCard'

function SettingsInstitutionCard({ workspace, loading = false }) {
  const workspaceName = workspace?.name?.trim() || '—'
  const logoUrl = workspace?.logo_url
  const description = workspace?.description?.trim() || 'لم تُضف نبذة عن المؤسسة بعد.'

  return (
    <SettingsCard title="إعدادات المؤسسة" icon={Building2}>
      <p className="-mt-2 mb-5 text-xs leading-6 text-[var(--shell-text-muted)]">
        تظهر هذه البيانات لجميع أعضاء المؤسسة داخل المنصة.
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
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">اسم المؤسسة</p>
          <p className="text-sm font-semibold text-[var(--shell-text)]">
            {loading && !workspaceName ? '...' : workspaceName}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">نوع المؤسسة</p>
          <p className="text-sm font-semibold text-[var(--shell-text)]">
            {loading ? '...' : getInstitutionTypeLabel(workspace)}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-right">
          <p className="mb-1 text-xs font-semibold text-[var(--shell-text-muted)]">الوصف</p>
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
        تعديل بيانات المؤسسة
      </button>
    </SettingsCard>
  )
}

export default SettingsInstitutionCard
