import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AssignTeacherModal from '../../components/subjects/AssignTeacherModal'
import SubjectDetailsBreadcrumb from '../../components/subjects/details/SubjectDetailsBreadcrumb'
import SubjectDetailsHeader from '../../components/subjects/details/SubjectDetailsHeader'
import SubjectDetailsStats from '../../components/subjects/details/SubjectDetailsStats'
import SubjectDetailsTabs from '../../components/subjects/details/SubjectDetailsTabs'
import SubjectExamsTab from '../../components/subjects/details/SubjectExamsTab'
import SubjectOverviewTab from '../../components/subjects/details/SubjectOverviewTab'
import SubjectQuestionBanksTab from '../../components/subjects/details/SubjectQuestionBanksTab'
import SubjectTeachersTab from '../../components/subjects/details/SubjectTeachersTab'
import EditSubjectModal from '../../components/subjects/EditSubjectModal'
import { useSubjectDetails } from '../../hooks/subjects/useSubjectDetails'
import { removeTeacherFromSubject } from '../../services/subjects.service'
import { useToastStore } from '../../store/toastStore'

function SubjectDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-56 animate-pulse rounded bg-[#E5E9EB]" />
      <div className="h-32 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-10 animate-pulse rounded bg-[#E5E9EB]" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
    </div>
  )
}

function SubjectDetailsPage() {
  const { id } = useParams()
  const showToast = useToastStore((s) => s.showToast)
  const {
    subject,
    teachers,
    questionBanks,
    questionBanksCount,
    topics,
    studentsCount,
    loading,
    error,
    refetch,
  } = useSubjectDetails(id)
  const [activeTab, setActiveTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const assignedIds = teachers.map((t) => t.membership_id).filter(Boolean)

  const handleRemoveTeacher = async (membershipId) => {
    try {
      await removeTeacherFromSubject(id, membershipId)
      showToast('تم إزالة المعلم من المادة')
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (loading) return <SubjectDetailsSkeleton />

  if (error || !subject) {
    return <p className="text-red-600">{error || 'المادة غير موجودة'}</p>
  }

  return (
    <div className="space-y-6">
      <SubjectDetailsBreadcrumb />
      <SubjectDetailsHeader
        subject={subject}
        onAssign={() => setAssignOpen(true)}
        onEdit={() => setEditOpen(true)}
      />
      <SubjectDetailsStats
        teachersCount={teachers.length}
        questionBanksCount={questionBanksCount}
        studentsCount={studentsCount}
      />
      <SubjectDetailsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' ? (
        <SubjectOverviewTab
          subject={subject}
          teachers={teachers}
          questionBanks={questionBanks}
          topics={topics}
          onViewAllTeachers={() => setActiveTab('teachers')}
          onRefreshTopics={refetch}
        />
      ) : null}

      {activeTab === 'teachers' ? (
        <SubjectTeachersTab teachers={teachers} onRemove={handleRemoveTeacher} />
      ) : null}

      {activeTab === 'banks' ? <SubjectQuestionBanksTab questionBanks={questionBanks} /> : null}
      {activeTab === 'exams' ? <SubjectExamsTab /> : null}

      <EditSubjectModal
        open={editOpen}
        subject={subject}
        onClose={() => setEditOpen(false)}
        onSuccess={refetch}
      />

      <AssignTeacherModal
        open={assignOpen}
        subjectId={subject.id}
        assignedIds={assignedIds}
        onClose={() => setAssignOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

export default SubjectDetailsPage
