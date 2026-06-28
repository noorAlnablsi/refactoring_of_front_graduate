import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal'
import EditSubjectModal from '../../components/subjects/EditSubjectModal'
import SubjectStatsCards from '../../components/subjects/SubjectStatsCards'
import SubjectsPagination from '../../components/subjects/SubjectsPagination'
import SubjectsSortSelect from '../../components/subjects/SubjectsSortSelect'
import SubjectsTable from '../../components/subjects/SubjectsTable'
import { canCreateSubject } from '../../lib/workspaceContext'
import { useSubjects } from '../../hooks/subjects/useSubjects'
import { useSubjectsListView } from '../../hooks/subjects/useSubjectsListView'
import { useWorkspaceTeachersCount } from '../../hooks/subjects/useWorkspaceTeachersCount'
import { deleteSubject } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'

function SubjectsPage() {
  const showToast = useToastStore((s) => s.showToast)
  const { subjects, loading, error, refetch } = useSubjects()
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => !subject.is_archived),
    [subjects],
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
      showToast('تم حذف المادة')
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
          <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-3xl">المواد الدراسية</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
            إدارة المواد الدراسية وتحديد المعلمين المسؤولين عنها داخل المؤسسة التعليمية بكفاءة
            واحترافية.
          </p>
        </div>
        {canCreateSubject() ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.2)]"
          >
            <Plus className="h-4 w-4" />
            إضافة مادة جديدة
          </button>
        ) : null}
      </div>

      <SubjectStatsCards
        subjectsCount={totalCount}
        teachersCount={teachersCount}
        teachersLoading={loadingTeachers}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && totalCount > 0 ? (
        <div className="flex justify-end">
          <SubjectsSortSelect value={sortKey} onChange={setSortKey} />
        </div>
      ) : null}

      <SubjectsTable
        subjects={paginatedSubjects}
        loading={loading}
        onEdit={handleEdit}
        onDelete={setDeleteSubjectItem}
      />

      <SubjectsPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {!loading && totalCount > 0 ? (
        <p className="text-center text-sm text-[#94A3B8]">
          عرض {rangeStart}–{rangeEnd} من أصل {totalCount} مادة
        </p>
      ) : null}

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
        itemLabel="المادة"
        itemName={deleteSubjectItem?.name}
        loading={deleteLoading}
        onClose={() => setDeleteSubjectItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default SubjectsPage
