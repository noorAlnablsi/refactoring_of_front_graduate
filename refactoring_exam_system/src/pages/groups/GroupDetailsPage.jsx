import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import AddGroupMembersModal from '../../components/groups/AddGroupMembersModal'
import EditGroupModal from '../../components/groups/EditGroupModal'
import SubjectsPagination from '../../components/subjects/SubjectsPagination'
import UserAvatar from '../../components/dashboard/UserAvatar'
import { ROUTES } from '../../constants/routes'
import { useGroupDetails } from '../../hooks/groups/useGroupDetails'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  canAccessStudentGroups,
  canEditStudentGroup,
} from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellCardClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSubtleTextClass,
  shellTableHostClass,
  shellTableScrollClass,
} from '../../lib/shellUi'
import { deleteGroup, removeGroupMember } from '../../services/studentGroups.service'
import { useToastStore } from '../../store/toastStore'

const STUDENTS_PAGE_SIZE = 8

function GroupDetailsPage() {
  const { groupId } = useParams()
  const { t } = useTranslation('groups')
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const { group, loading, error, refetch } = useGroupDetails(groupId)

  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [page, setPage] = useState(1)

  const canEdit = canEditStudentGroup(group)

  const students = group?.students || []
  const totalCount = students.length
  const totalPages = Math.max(1, Math.ceil(totalCount / STUDENTS_PAGE_SIZE))
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * STUDENTS_PAGE_SIZE
    return students.slice(start, start + STUDENTS_PAGE_SIZE)
  }, [students, page])
  const rangeStart = totalCount ? (page - 1) * STUDENTS_PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(page * STUDENTS_PAGE_SIZE, totalCount)

  if (!canAccessStudentGroups()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteGroup(group.id)
      showToast(t('toasts.deleted'))
      navigate(ROUTES.GROUPS)
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.deleteFailed'), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRemove = async (membershipId) => {
    setRemovingId(membershipId)
    try {
      await removeGroupMember(group.id, membershipId)
      showToast(t('toasts.memberRemoved'))
      refetch()
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.removeMemberFailed'), 'error')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return <p className={`py-16 text-center ${shellBodyTextClass}`}>{t('details.loading')}</p>
  }

  if (error || !group) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || t('details.notFound')}
        </p>
        <Link to={ROUTES.GROUPS} className="text-sm font-bold text-[var(--shell-accent)]">
          {t('pageTitle')}
        </Link>
      </div>
    )
  }

  const groupTitle = [group.name, group.subject?.name].filter(Boolean).join(' - ')

  return (
    <div className="relative space-y-6 pb-20">
      <div className="text-sm text-[var(--shell-text-muted)]">
        <Link to={ROUTES.GROUPS} className="font-semibold text-[var(--shell-accent)]">
          {t('pageTitle')}
        </Link>
        <span className="mx-2">›</span>
        <span>{t('details.breadcrumb')}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('details.title')}</h1>
          <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>{t('details.subtitle')}</p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setEditOpen(true)} className={shellAccentButtonClass}>
              <Pencil className="h-4 w-4" />
              {t('details.edit')}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              {t('details.delete')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)]">
        <section className="min-w-0 rounded-2xl bg-[var(--shell-accent)] p-6 text-white shadow-[var(--shell-shadow-accent)]">
          <h2 className="break-words text-xl font-extrabold leading-8 md:text-2xl">{groupTitle}</h2>
          {group.description ? <p className="mt-2 text-sm leading-7 opacity-90">{group.description}</p> : null}
          <div className="mt-6 space-y-3 text-sm font-semibold">
            <p className="flex items-center gap-2.5">
              <Users className="h-4 w-4 shrink-0 opacity-90" />
              <span>
                {t('details.teacher')}: {group.ownerName}
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 shrink-0 opacity-90" />
              <span>
                {t('details.subject')}: {group.subject?.name || '—'}
              </span>
            </p>
          </div>
        </section>

        <section className={`flex flex-col justify-center p-6 ${shellCardClass}`}>
          <p className={`text-sm font-semibold ${shellSubtleTextClass}`}>{t('details.totalStudents')}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
              <Users className="h-5 w-5" />
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-[var(--shell-text)]">
              {formatLocaleNumber(group.studentCount)}
            </p>
          </div>
        </section>
      </div>

      <section className={`${shellTableHostClass} ${shellCardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-4">
          <h2 className={`text-base ${shellPageTitleClass}`}>{t('details.studentsTitle')}</h2>
        </div>

        <div className={shellTableScrollClass}>
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="border-b border-[var(--shell-border)] text-xs text-[var(--shell-text-muted)]">
              <tr>
                <th className="px-5 py-3 font-semibold">{t('details.studentName')}</th>
                <th className="px-5 py-3 font-semibold">{t('details.email')}</th>
                {canEdit ? (
                  <th className="px-5 py-3 font-semibold">{t('details.actions')}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 3 : 2}
                    className={`px-5 py-10 text-center ${shellBodyTextClass}`}
                  >
                    {t('details.emptyStudents')}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.membershipId}
                    className="border-b border-[var(--shell-border)] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={{ full_name: student.fullName }}
                          size="sm"
                          rounded
                        />
                        <span className="font-bold text-[var(--shell-text)]">{student.fullName}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${shellBodyTextClass}`}>{student.email}</td>
                    {canEdit ? (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={removingId === student.membershipId}
                          onClick={() => handleRemove(student.membershipId)}
                          className="text-sm font-bold text-red-500 disabled:opacity-50"
                        >
                          {t('details.remove')}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--shell-border)] px-5 py-4">
            <p className={shellSubtleTextClass}>
              {t('details.pagination', {
                from: formatLocaleNumber(rangeStart),
                to: formatLocaleNumber(rangeEnd),
                total: formatLocaleNumber(totalCount),
              })}
            </p>
            <SubjectsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        ) : null}
      </section>

      {canEdit ? (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="fixed bottom-6 end-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shell-accent)] text-white shadow-[var(--shell-shadow-accent)] transition hover:brightness-110 md:bottom-8 md:end-8"
          aria-label={t('details.addStudents')}
        >
          <UserPlus className="h-6 w-6" strokeWidth={2.2} />
        </button>
      ) : null}

      <EditGroupModal
        open={editOpen}
        group={group}
        onClose={() => setEditOpen(false)}
        onSuccess={refetch}
      />

      <AddGroupMembersModal
        open={addOpen}
        group={group}
        onClose={() => setAddOpen(false)}
        onSuccess={refetch}
      />

      <SoftDeleteConfirmDialog
        open={deleteOpen}
        itemLabel={t('delete.itemLabel')}
        itemName={group.name}
        title={t('delete.title')}
        message={t('delete.message')}
        recoveryNote={t('delete.recoveryNote')}
        loading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default GroupDetailsPage
