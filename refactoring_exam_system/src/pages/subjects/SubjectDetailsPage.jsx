import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AssignStudentsModal from '../../components/subjects/AssignStudentsModal'
import AssignTeacherModal from '../../components/subjects/AssignTeacherModal'
import SubjectDetailsBreadcrumb from '../../components/subjects/details/SubjectDetailsBreadcrumb'
import SubjectDetailsHeader from '../../components/subjects/details/SubjectDetailsHeader'
import SubjectDetailsStats from '../../components/subjects/details/SubjectDetailsStats'
import SubjectDetailsTabs from '../../components/subjects/details/SubjectDetailsTabs'
import SubjectExamsTab from '../../components/subjects/details/SubjectExamsTab'
import SubjectOverviewTab from '../../components/subjects/details/SubjectOverviewTab'
import SubjectQuestionBanksTab from '../../components/subjects/details/SubjectQuestionBanksTab'
import SubjectStudentsTab from '../../components/subjects/details/SubjectStudentsTab'
import SubjectTeachersTab from '../../components/subjects/details/SubjectTeachersTab'
import { useSubjectDetails } from '../../hooks/subjects/useSubjectDetails'
import { removeTeacherFromSubject } from '../../services/subjects.service'
import { getStudentMembershipId } from '../../lib/workspaceStudents'
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
  const { t } = useTranslation('subjects')
  const { id } = useParams()
  const showToast = useToastStore((s) => s.showToast)
  const {
    subject,
    teachers,
    questionBanks,
    questionBanksCount,
    topics,
    students,
    studentsCount,
    tests,
    testsLoading,
    testsError,
    loading,
    error,
    refetch,
  } = useSubjectDetails(id)
  const [activeTab, setActiveTab] = useState('overview')
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false)
  const [assignStudentsOpen, setAssignStudentsOpen] = useState(false)

  const assignedTeacherIds = teachers.map((teacher) => teacher.membership_id).filter(Boolean)
  const enrolledStudentIds = students
    .map((student) => getStudentMembershipId(student))
    .filter(Boolean)
  const testsCount = subject?.tests_count ?? tests.length
  const publishedTestsCount = tests.filter(
    (test) => String(test.status || '').toUpperCase() === 'PUBLISHED',
  ).length

  const handleRemoveTeacher = async (membershipId) => {
    try {
      await removeTeacherFromSubject(id, membershipId)
      showToast(t('toasts.teacherRemoved'))
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (loading) return <SubjectDetailsSkeleton />

  if (error || !subject) {
    return <p className="text-red-600">{error || t('notFound')}</p>
  }

  return (
    <div className="min-w-0 space-y-6">
      <SubjectDetailsBreadcrumb />
      <SubjectDetailsHeader
        subject={subject}
        onAssignTeacher={() => setAssignTeacherOpen(true)}
        onAssignStudents={() => setAssignStudentsOpen(true)}
      />
      <SubjectDetailsStats
        teachersCount={teachers.length}
        questionBanksCount={questionBanksCount}
        testsCount={testsCount}
        enrolledStudentsCount={studentsCount}
        publishedTestsCount={testsLoading ? null : publishedTestsCount}
      />
      <SubjectDetailsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' ? (
        <SubjectOverviewTab
          subject={subject}
          teachers={teachers}
          students={students}
          questionBanks={questionBanks}
          topics={topics}
          exams={tests}
          examsLoading={testsLoading}
          examsError={testsError}
          onViewAllTeachers={() => setActiveTab('teachers')}
          onViewAllStudents={() => setActiveTab('students')}
          onRefreshTopics={refetch}
        />
      ) : null}

      {activeTab === 'teachers' ? (
        <SubjectTeachersTab teachers={teachers} onRemove={handleRemoveTeacher} />
      ) : null}

      {activeTab === 'students' ? <SubjectStudentsTab students={students} /> : null}

      {activeTab === 'banks' ? <SubjectQuestionBanksTab questionBanks={questionBanks} /> : null}
      {activeTab === 'exams' ? (
        <SubjectExamsTab exams={tests} loading={testsLoading} error={testsError} />
      ) : null}

      <AssignTeacherModal
        open={assignTeacherOpen}
        subjectId={subject.id}
        assignedIds={assignedTeacherIds}
        onClose={() => setAssignTeacherOpen(false)}
        onSuccess={refetch}
      />

      <AssignStudentsModal
        open={assignStudentsOpen}
        subjectId={subject.id}
        enrolledIds={enrolledStudentIds}
        onClose={() => setAssignStudentsOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

export default SubjectDetailsPage
