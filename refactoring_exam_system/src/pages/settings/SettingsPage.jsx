import { Link } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import {
  SettingsAppearanceCard,
  SettingsPrivacyCard,
} from '../../components/settings/SettingsAppearanceCard'
import SettingsInstitutionCard from '../../components/settings/SettingsInstitutionCard'
import {
  SettingsProfileCard,
  SettingsWorkspacesCard,
} from '../../components/settings/SettingsProfileSection'
import { useSettingsWorkspace } from '../../hooks/useSettingsWorkspace'
import { getActiveMembership, isInstitutionOwner } from '../../lib/workspaceContext'

function SettingsPage() {
  const membership = getActiveMembership()
  const showInstitutionSettings = isInstitutionOwner(membership)
  const { workspace, loading: workspaceLoading } = useSettingsWorkspace()

  const institutionWorkspace = showInstitutionSettings
    ? { ...membership?.workspace, ...workspace }
    : null

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-3 flex items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <Link to={ROUTES.DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
            الرئيسية
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-[var(--shell-accent)]">الإعدادات</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
            <Settings className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--shell-text)] md:text-3xl">الإعدادات</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SettingsProfileCard />
          {showInstitutionSettings ? (
            <SettingsInstitutionCard workspace={institutionWorkspace} loading={workspaceLoading} />
          ) : null}
          <SettingsWorkspacesCard />
        </div>

        <div className="space-y-6">
          <SettingsAppearanceCard />
          <SettingsPrivacyCard />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
