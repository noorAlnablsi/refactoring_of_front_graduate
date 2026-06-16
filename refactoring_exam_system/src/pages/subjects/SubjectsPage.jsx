import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal'
import EditSubjectModal from '../../components/subjects/EditSubjectModal'
import SubjectStatsCards from '../../components/subjects/SubjectStatsCards'
import SubjectsTable from '../../components/subjects/SubjectsTable'
import { canCreateSubject } from '../../lib/workspaceContext'
import { useSubjects } from '../../hooks/subjects/useSubjects'

function SubjectsPage() {
  const { subjects, count, loading, error, refetch } = useSubjects()
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

      <SubjectStatsCards subjectsCount={count} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SubjectsTable subjects={subjects} loading={loading} onEdit={handleEdit} />

      <p className="text-center text-sm text-[#94A3B8]">
        عرض {subjects.length} من أصل {count} مادة
      </p>

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
