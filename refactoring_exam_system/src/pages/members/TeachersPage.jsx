import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, UserPlus } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import SendInviteModal from '../../components/invites/SendInviteModal'
import AssignSubjectToTeacherModal from '../../components/members/teachers/AssignSubjectToTeacherModal'
import EditMemberProfileModal from '../../components/members/EditMemberProfileModal'
import TeachersBreadcrumb from '../../components/members/teachers/TeachersBreadcrumb'
import TeachersSummaryCards from '../../components/members/teachers/TeachersSummaryCards'
import TeachersTable from '../../components/members/teachers/TeachersTable'
import { ROUTES } from '../../constants/routes'
import { useTeachersList } from '../../hooks/members/useTeachersList'
import { tUI } from '../../lib/appToast'
import { getTeacherMembershipId } from '../../lib/workspaceTeachers'
import {
  canAccessMembersModule,
  isInstitutionWorkspace,
} from '../../lib/workspaceContext'
import { removeWorkspaceTeacher } from '../../services/workspaces.service'
import { useToastStore } from '../../store/toastStore'
import {
  shellAccentButtonClass,
  shellGhostButtonClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function TeachersPage() {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [assignTeacher, setAssignTeacher] = useState(null)
  const [editTeacher, setEditTeacher] = useState(null)
  const [removeTeacher, setRemoveTeacher] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const { teachers, total, pages, loading, error, refetch, activeRate } = useTeachersList({
    search,
    page,
    perPage,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  if (!canAccessMembersModule() || !isInstitutionWorkspace()) {
    return <Navigate to={ROUTES.MEMBERS} replace />
  }

  const handleRemove = async () => {
    const membershipId = getTeacherMembershipId(removeTeacher)
    if (!membershipId) {
      showToast(tUI('toasts.teacherMembershipNotFound', { ns: 'members' }), 'error')
      return
    }

    setRemoveLoading(true)
    try {
      await removeWorkspaceTeacher(membershipId)
      showToast(tUI('toasts.teacherRemoved', { ns: 'members' }))
      setRemoveTeacher(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <TeachersBreadcrumb />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('teachers.pageTitle')}</h1>
          <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>{t('teachers.pageSubtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            title={t('comingSoon', { ns: 'common' })}
            className={`${shellGhostButtonClass} inline-flex items-center gap-2 opacity-70`}
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            {t('exportData')}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className={`${shellAccentButtonClass} inline-flex items-center gap-2`}
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            {t('teachers.add')}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <TeachersSummaryCards total={total} activeRate={activeRate} loading={loading} />

      <TeachersTable
        teachers={teachers}
        loading={loading}
        search={searchInput}
        onSearchChange={setSearchInput}
        page={page}
        totalPages={pages}
        totalCount={total}
        perPage={perPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onAssignSubject={setAssignTeacher}
        onEditProfile={setEditTeacher}
        onRemove={setRemoveTeacher}
      />

      <SendInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        defaultRole="TEACHER"
        onSuccess={refetch}
      />

      <AssignSubjectToTeacherModal
        open={Boolean(assignTeacher)}
        teacher={assignTeacher}
        onClose={() => setAssignTeacher(null)}
        onSuccess={refetch}
      />

      <EditMemberProfileModal
        open={Boolean(editTeacher)}
        member={editTeacher}
        memberLabel={t('roles.teacher')}
        onClose={() => setEditTeacher(null)}
        onSuccess={refetch}
      />

      <SoftDeleteConfirmDialog
        open={Boolean(removeTeacher)}
        itemLabel={t('roles.teacher')}
        itemName={removeTeacher?.full_name}
        loading={removeLoading}
        onClose={() => setRemoveTeacher(null)}
        onConfirm={handleRemove}
      />
    </div>
  )
}

export default TeachersPage
