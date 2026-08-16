import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal'
import EditSubjectModal from '../../components/subjects/EditSubjectModal'
import SubjectStatsCards from '../../components/subjects/SubjectStatsCards'
import SubjectsTable from '../../components/subjects/SubjectsTable'
import { getSubjectTestsCount } from '../../lib/subjectDisplay'
import { canCreateSubject } from '../../lib/workspaceContext'
import { useSubjects } from '../../hooks/subjects/useSubjects'
import { useSubjectsListView } from '../../hooks/subjects/useSubjectsListView'
import { useWorkspaceTeachersCount } from '../../hooks/subjects/useWorkspaceTeachersCount'
import { deleteSubject } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'
import {
  shellAccentButtonClass,
  shellCardClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSearchInputClass,
} from '../../lib/shellUi'

function SubjectsPage() {
  const { t } = useTranslation('subjects')
  const showToast = useToastStore((s) => s.showToast)
  const [searchInput, setSearchInput] = useState('')
  const { subjects, loading, error, refetch, debouncedSearch } = useSubjects({ search: searchInput })
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => !subject.is_archived),
    [subjects],
  )
  const totalExamsCount = useMemo(
    () =>
      activeSubjects.reduce((sum, subject) => {
        const count = getSubjectTestsCount(subject)
        return sum + (Number.isFinite(count) ? count : 0)
      }, 0),
    [activeSubjects],
  )
  const { teachersCount, loadingTeachers } = useWorkspaceTeachersCount()
  const {
    sortKey,
    setSortKey,
    page,
    setPage,
    paginatedSubjects,
    totalPages,
    totalCount,
    rangeStart,
    rangeEnd,
  } = useSubjectsListView(activeSubjects)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [deleteSubjectItem, setDeleteSubjectItem] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleEdit = (subject) => {
    setSelectedSubject(subject)
    setEditOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteSubjectItem) return
    setDeleteLoading(true)
    try {
      await deleteSubject(deleteSubjectItem.id)
      showToast(t('toasts.deleted'))
      setDeleteSubjectItem(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
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
        {canCreateSubject() ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={shellAccentButtonClass}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t('addSubject')}
          </button>
        ) : null}
      </div>

      <SubjectStatsCards
        subjectsCount={totalCount}
        teachersCount={teachersCount}
        teachersLoading={loadingTeachers}
        examsCount={totalExamsCount}
      />

      <div className={`p-4 ${shellCardClass}`}>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={shellSearchInputClass}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SubjectsTable
        subjects={paginatedSubjects}
        loading={loading}
        sortKey={sortKey}
        onSortChange={setSortKey}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        emptyMessage={debouncedSearch ? t('table.emptySearch') : undefined}
        onEdit={handleEdit}
        onDelete={setDeleteSubjectItem}
      />

      <CreateSubjectModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refetch} />

      <EditSubjectModal
        open={editOpen}
        subject={selectedSubject}
        onClose={() => {
          setEditOpen(false)
          setSelectedSubject(null)
        }}
        onSuccess={refetch}
      />

      <SoftDeleteConfirmDialog
        open={Boolean(deleteSubjectItem)}
        itemLabel={t('deleteItemLabel')}
        itemName={deleteSubjectItem?.name}
        loading={deleteLoading}
        onClose={() => setDeleteSubjectItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default SubjectsPage
