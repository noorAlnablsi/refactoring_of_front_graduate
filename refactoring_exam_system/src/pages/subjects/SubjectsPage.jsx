import { useState } from 'react'
import { Plus } from 'lucide-react'
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

function SubjectsPage() {
  const { subjects, count, loading, error, refetch } = useSubjects()
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
  } = useSubjectsListView(subjects)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)

  const handleEdit = (subject) => {
    setSelectedSubject(subject)
    setEditOpen(true)
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
        subjectsCount={count}
        teachersCount={teachersCount}
        teachersLoading={loadingTeachers}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && totalCount > 0 ? (
        <div className="flex justify-end">
          <SubjectsSortSelect value={sortKey} onChange={setSortKey} />
        </div>
      ) : null}

      <SubjectsTable subjects={paginatedSubjects} loading={loading} onEdit={handleEdit} />

      <SubjectsPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {!loading && totalCount > 0 ? (
        <p className="text-center text-sm text-[#94A3B8]">
          عرض {rangeStart}–{rangeEnd} من أصل {count || totalCount} مادة
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

    </div>
  )
}

export default SubjectsPage
