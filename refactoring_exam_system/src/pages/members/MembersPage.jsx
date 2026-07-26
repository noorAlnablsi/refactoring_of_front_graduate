import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MembersGroupsPreview from '../../components/groups/MembersGroupsPreview'
import MembersStatsCards from '../../components/members/MembersStatsCards'
import { ROUTES } from '../../constants/routes'
import { useMembersGroupsPreview } from '../../hooks/groups/useMembersGroupsPreview'
import { useMembersOverview } from '../../hooks/members/useMembersOverview'
import { canAccessMembersModule } from '../../lib/workspaceContext'
import { shellPageSubtitleClass, shellPageTitleClass } from '../../lib/shellUi'

function MembersPage() {
  const { t } = useTranslation('members')
  const { studentsTotal, teachersTotal, loading, error, isInstitution } = useMembersOverview()
  const { groups, loading: groupsLoading } = useMembersGroupsPreview(5)

  if (!canAccessMembersModule()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('pageTitle')}</h1>
        <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>{t('pageSubtitle')}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <MembersStatsCards
        studentsTotal={studentsTotal}
        teachersTotal={teachersTotal}
        loading={loading}
        isInstitution={isInstitution}
      />

      <MembersGroupsPreview groups={groups} loading={groupsLoading} />
    </div>
  )
}

export default MembersPage
