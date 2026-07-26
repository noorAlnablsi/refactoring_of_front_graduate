import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['settings', 'navigation'])
  const membership = getActiveMembership()
  const showInstitutionSettings = isInstitutionOwner(membership)
  const { workspace, loading: workspaceLoading } = useSettingsWorkspace()

  const institutionWorkspace = showInstitutionSettings
    ? { ...membership?.workspace, ...workspace }
    : null

  return (
    <div className="space-y-5">
      <div>
        <nav className="mb-2.5 flex items-center gap-2 text-sm text-[var(--shell-text-muted)]">
          <Link to={ROUTES.DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
            {t('breadcrumb.home', { ns: 'navigation' })}
          </Link>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-[var(--shell-accent)]">{t('pageTitle')}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shell-accent)] text-[var(--shell-accent-contrast)] shadow-[var(--shell-shadow-accent)]">
            <Settings className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <h1 className="text-xl font-extrabold text-[var(--shell-text)] md:text-2xl">{t('pageTitle')}</h1>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2.07fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <SettingsProfileCard />
          {showInstitutionSettings ? (
            <SettingsInstitutionCard workspace={institutionWorkspace} loading={workspaceLoading} />
          ) : null}
          <SettingsWorkspacesCard />
        </div>

        <div className="flex w-full flex-col gap-5">
          <SettingsAppearanceCard />
          <SettingsPrivacyCard />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
