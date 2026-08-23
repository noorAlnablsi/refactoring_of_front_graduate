import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import MembersGroupsPreview from '../../components/groups/MembersGroupsPreview'
import ImportMembersCsvModal from '../../components/members/ImportMembersCsvModal'
import MembersStatsCards from '../../components/members/MembersStatsCards'
import { ROUTES } from '../../constants/routes'
import { useMembersGroupsPreview } from '../../hooks/groups/useMembersGroupsPreview'
import { useMembersOverview } from '../../hooks/members/useMembersOverview'
import {
  canAccessMembersModule,
  canBulkImportWorkspaceMembers,
  canShowStudentGroupsInSidebar,
} from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function MembersPage() {
  const { t } = useTranslation('members')
  const { studentsTotal, teachersTotal, loading, error, isInstitution, refetch } =
    useMembersOverview()
  const { groups, loading: groupsLoading } = useMembersGroupsPreview(5)
  const [importOpen, setImportOpen] = useState(false)
  const canImport = canBulkImportWorkspaceMembers()
  const showGroups = canShowStudentGroupsInSidebar()

  if (!canAccessMembersModule()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('pageTitle')}</h1>
          <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>
            {isInstitution ? t('pageSubtitle') : t('pageSubtitleSolo')}
          </p>
        </div>
        {canImport ? (
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className={shellAccentButtonClass}
          >
            <Upload className="h-4 w-4" strokeWidth={2.5} />
            {t('csv.import')}
          </button>
        ) : null}
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

      {showGroups ? (
        <MembersGroupsPreview groups={groups} loading={groupsLoading} />
      ) : null}

      <ImportMembersCsvModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch?.()
        }}
      />
    </div>
  )
}

export default MembersPage
