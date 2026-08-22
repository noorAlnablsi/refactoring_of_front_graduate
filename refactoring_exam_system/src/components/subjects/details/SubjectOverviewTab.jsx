import { useTranslation } from 'react-i18next'
import { FolderOpen } from 'lucide-react'
import UserAvatar from '../../dashboard/UserAvatar'
import {
  getQuestionBankName,
  getTeacherName,
  getTeacherSpecialty,
  sortByRecentDate,
} from '../../../lib/subjectDisplay'
import { isSoloTeacher } from '../../../lib/workspaceContext'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import TeacherAvatar from './TeacherAvatar'
import SubjectTopicsSection from './SubjectTopicsSection'
import { SubjectRecentExamsPanel } from './SubjectExamsTab'

function SubjectOverviewTab({
  subject,
  teachers,
  students = [],
  questionBanks,
  topics,
  exams = [],
  examsLoading = false,
  examsError = '',
  onViewAllTeachers,
  onViewAllStudents,
  onRefreshTopics,
}) {
  const { t } = useTranslation(['subjects', 'common'])
  const showRecentStudents = isSoloTeacher()
  const recentTeachers = sortByRecentDate(teachers).slice(0, 2)
  const recentStudents = sortByRecentDate(students, [
    'enrolled_at',
    'assigned_at',
    'created_at',
    'updated_at',
  ]).slice(0, 2)
  const recentBanks = sortByRecentDate(questionBanks).slice(0, 3)
  const recentExams = exams.slice(0, 5)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <h2 className="text-lg font-bold text-[#2A3433]">{t('details.overview.descriptionTitle')}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#64748B]">
            {subject.description?.trim() || t('details.overview.noDescription')}
          </p>
        </section>

        <SubjectTopicsSection
          subjectId={subject.id}
          topics={topics}
          onRefresh={onRefreshTopics}
        />

        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#2A3433]">
              {showRecentStudents
                ? t('details.overview.recentStudents')
                : t('details.overview.recentTeachers')}
            </h2>
            {showRecentStudents ? (
              students.length > 0 ? (
                <button
                  type="button"
                  onClick={onViewAllStudents}
                  className="text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
                >
                  {t('actions.viewAll', { ns: 'common' })}
                </button>
              ) : null
            ) : teachers.length > 0 ? (
              <button
                type="button"
                onClick={onViewAllTeachers}
                className="text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
              >
                {t('actions.viewAll', { ns: 'common' })}
              </button>
            ) : null}
          </div>

          {showRecentStudents ? (
            recentStudents.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">{t('details.students.empty')}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recentStudents.map((student) => {
                  const membershipId = getStudentMembershipId(student)
                  const fullName = student.full_name || student.name || '—'

                  return (
                    <div
                      key={membershipId ?? student.assignment_id ?? student.user_id}
                      className="flex items-center gap-3 rounded-2xl bg-[#F8FAFB] px-4 py-4 ring-1 ring-[#EEF2F3]"
                    >
                      <UserAvatar
                        user={{ full_name: fullName, avatar_url: student.avatar_url }}
                        size="md"
                        rounded
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#2A3433]">{fullName}</p>
                        <p className="mt-1 truncate text-xs text-[#94A3B8]">
                          {student.email || student.phone_number || student.phone || '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : recentTeachers.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t('details.overview.noTeachers')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentTeachers.map((teacher) => (
                <div
                  key={teacher.assignment_id || teacher.membership_id}
                  className="flex items-center gap-3 rounded-2xl bg-[#F8FAFB] px-4 py-4 ring-1 ring-[#EEF2F3]"
                >
                  <TeacherAvatar teacher={teacher} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#2A3433]">{getTeacherName(teacher)}</p>
                    <p className="mt-1 truncate text-xs text-[#94A3B8]">
                      {getTeacherSpecialty(teacher)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <SubjectRecentExamsPanel exams={recentExams} loading={examsLoading} error={examsError} />

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[#94A3B8]" />
            <h2 className="text-base font-bold text-[#2A3433]">{t('details.overview.recentBanks')}</h2>
          </div>
          {recentBanks.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t('details.overview.noBanks')}</p>
          ) : (
            <ul className="space-y-3">
              {recentBanks.map((bank) => (
                <li key={bank.id} className="flex items-start gap-2.5 text-sm text-[#64748B]">
                  <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1]" />
                  <span className="leading-6">{getQuestionBankName(bank)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  )
}

export default SubjectOverviewTab
