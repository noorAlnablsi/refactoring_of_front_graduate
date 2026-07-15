import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, UserPlus } from 'lucide-react'
import SendInviteModal from '../../components/invites/SendInviteModal'
import EditMemberProfileModal from '../../components/members/EditMemberProfileModal'
import AssignSubjectToStudentModal from '../../components/members/students/AssignSubjectToStudentModal'
import RemoveStudentFromSubjectModal from '../../components/members/students/RemoveStudentFromSubjectModal'
import StudentsBreadcrumb from '../../components/members/students/StudentsBreadcrumb'
import StudentsSummaryCards from '../../components/members/students/StudentsSummaryCards'
import StudentsTable from '../../components/members/students/StudentsTable'
import { ROUTES } from '../../constants/routes'
import { useStudentsList } from '../../hooks/members/useStudentsList'
import { canAccessMembersModule } from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellGhostButtonClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'

function StudentsPage() {
  const { t } = useTranslation(['members', 'common'])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [assignStudent, setAssignStudent] = useState(null)
  const [editStudent, setEditStudent] = useState(null)
  const [removeStudent, setRemoveStudent] = useState(null)

  const { students, total, activeTotal, pages, loading, error, refetch } = useStudentsList({
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

  if (!canAccessMembersModule()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="space-y-6">
      <StudentsBreadcrumb />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('students.pageTitle')}</h1>
          <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>{t('students.pageSubtitle')}</p>
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
            {t('students.invite')}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <StudentsSummaryCards total={total} activeTotal={activeTotal} loading={loading} />

      <StudentsTable
        students={students}
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
        onAssignSubject={setAssignStudent}
        onEditProfile={setEditStudent}
        onRemove={setRemoveStudent}
      />

      <SendInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        defaultRole="STUDENT"
        onSuccess={refetch}
      />

      <AssignSubjectToStudentModal
        open={Boolean(assignStudent)}
        student={assignStudent}
        onClose={() => setAssignStudent(null)}
        onSuccess={refetch}
      />

      <EditMemberProfileModal
        open={Boolean(editStudent)}
        member={editStudent}
        memberLabel={t('roles.student')}
        onClose={() => setEditStudent(null)}
        onSuccess={refetch}
      />

      <RemoveStudentFromSubjectModal
        open={Boolean(removeStudent)}
        student={removeStudent}
        onClose={() => setRemoveStudent(null)}
        onSuccess={refetch}
      />
    </div>
  )
}

export default StudentsPage
