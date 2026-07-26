import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import CreateGroupModal from '../../components/groups/CreateGroupModal'
import EditGroupModal from '../../components/groups/EditGroupModal'
import GroupsSubjectTabs from '../../components/groups/GroupsSubjectTabs'
import GroupsTable from '../../components/groups/GroupsTable'
import { ROUTES } from '../../constants/routes'
import { useStudentGroupsPage } from '../../hooks/groups/useStudentGroupsPage'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { canAccessStudentGroups } from '../../lib/workspaceContext'
import {
  shellAccentButtonClass,
  shellGhostButtonClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { deleteGroup } from '../../services/studentGroups.service'
import { useToastStore } from '../../store/toastStore'

function StudentGroupsPage() {
  const { t } = useTranslation('groups')
  const showToast = useToastStore((s) => s.showToast)
  const {
    groups,
    subjects,
    assignableSubjects,
    canMutate,
    loading,
    error,
    selectedSubjectId,
    setSelectedSubjectId,
    sortKey,
    setSortKey,
    page,
    setPage,
    totalPages,
    totalCount,
    rangeStart,
    rangeEnd,
    refetch,
  } = useStudentGroupsPage()

  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [deleteGroupItem, setDeleteGroupItem] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  if (!canAccessStudentGroups()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleDelete = async () => {
    if (!deleteGroupItem) return
    setDeleteLoading(true)
    try {
      await deleteGroup(deleteGroupItem.id)
      showToast(t('toasts.deleted'))
      setDeleteGroupItem(null)
      refetch()
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.deleteFailed'), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{t('pageTitle')}</h1>
          <p className={`mt-2 max-w-2xl ${shellPageSubtitleClass}`}>{t('pageSubtitle')}</p>
        </div>
        {canMutate ? (
          <button type="button" onClick={() => setCreateOpen(true)} className={shellAccentButtonClass}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t('createGroup')}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <GroupsSubjectTabs
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onChange={setSelectedSubjectId}
      />

      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-base ${shellPageTitleClass}`}>{t('activeListTitle')}</h2>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className={`${shellGhostButtonClass} h-10 px-3`}
          aria-label={t('sort.label')}
        >
          <option value="newest">{t('sort.label')}: {t('sort.newest')}</option>
          <option value="oldest">{t('sort.label')}: {t('sort.oldest')}</option>
          <option value="name">{t('sort.label')}: {t('sort.name')}</option>
        </select>
      </div>

      <GroupsTable
        groups={groups}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEdit={setEditGroup}
        onDelete={setDeleteGroupItem}
      />

      <CreateGroupModal
        open={createOpen}
        subjects={assignableSubjects}
        initialSubjectId={selectedSubjectId}
        onClose={() => setCreateOpen(false)}
        onSuccess={refetch}
      />

      <EditGroupModal
        open={Boolean(editGroup)}
        group={editGroup}
        onClose={() => setEditGroup(null)}
        onSuccess={refetch}
      />

      <SoftDeleteConfirmDialog
        open={Boolean(deleteGroupItem)}
        itemLabel={t('delete.itemLabel')}
        itemName={deleteGroupItem?.name}
        title={t('delete.title')}
        message={t('delete.message')}
        recoveryNote={t('delete.recoveryNote')}
        loading={deleteLoading}
        onClose={() => setDeleteGroupItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default StudentGroupsPage
