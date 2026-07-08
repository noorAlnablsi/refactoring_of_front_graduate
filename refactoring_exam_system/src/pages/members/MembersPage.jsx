import { Navigate } from 'react-router-dom'
import MembersLatestList from '../../components/members/MembersLatestList'
import MembersStatsCards from '../../components/members/MembersStatsCards'
import { ROUTES } from '../../constants/routes'
import { useMembersOverview } from '../../hooks/members/useMembersOverview'
import { canAccessMembersModule } from '../../lib/workspaceContext'
import { shellPageSubtitleClass, shellPageTitleClass } from '../../lib/shellUi'

function MembersPage() {
  const { studentsTotal, teachersTotal, latestMembers, loading, error, isInstitution } =
    useMembersOverview()

  if (!canAccessMembersModule()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>إدارة الأعضاء</h1>
        <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>
          إدارة جميع الطلاب والمعلمين داخل المؤسسة.
        </p>
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

      <MembersLatestList members={latestMembers} loading={loading} />
    </div>
  )
}

export default MembersPage
