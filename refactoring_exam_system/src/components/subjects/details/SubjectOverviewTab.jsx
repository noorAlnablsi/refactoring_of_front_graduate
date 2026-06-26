import { ClipboardList, FolderOpen } from 'lucide-react'
import {
  getQuestionBankName,
  getTeacherName,
  getTeacherSpecialty,
  sortByRecentDate,
} from '../../../lib/subjectDisplay'
import TeacherAvatar from './TeacherAvatar'
import SubjectTopicsSection from './SubjectTopicsSection'

const placeholderExams = [
  { id: 1, name: 'اختبار الميكانيكا', status: 'completed' },
  { id: 2, name: 'الديناميكا الحرارية', status: 'active' },
]

function SubjectOverviewTab({
  subject,
  teachers,
  questionBanks,
  topics,
  onViewAllTeachers,
  onRefreshTopics,
}) {
  const recentTeachers = sortByRecentDate(teachers).slice(0, 2)
  const recentBanks = sortByRecentDate(questionBanks).slice(0, 3)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <h2 className="text-lg font-bold text-[#2A3433]">وصف المادة</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#64748B]">
            {subject.description?.trim() ||
              'لا يوجد وصف مفصل لهذه المادة حالياً. يمكنك إضافة وصف يوضح أهداف المادة ومخرجاتها التعليمية من خلال تعديل المادة.'}
          </p>
        </section>

        <SubjectTopicsSection
          subjectId={subject.id}
          topics={topics}
          onRefresh={onRefreshTopics}
        />

        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#2A3433]">المعلمون المرتبطون حديثاً</h2>
            {teachers.length > 0 ? (
              <button
                type="button"
                onClick={onViewAllTeachers}
                className="text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
              >
                عرض الكل
              </button>
            ) : null}
          </div>

          {recentTeachers.length === 0 ? (            <p className="text-sm text-[#94A3B8]">لا يوجد معلمون مسندون لهذه المادة بعد</p>
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
        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#94A3B8]" />
            <h2 className="text-base font-bold text-[#2A3433]">آخر الاختبارات</h2>
          </div>
          <div className="space-y-3">
            {placeholderExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFB] px-3 py-3"
              >
                <span className="text-sm font-semibold text-[#374151]">{exam.name}</span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
                    exam.status === 'active'
                      ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {exam.status === 'active' ? 'نشط' : 'مكتمل'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[#94A3B8]" />
            <h2 className="text-base font-bold text-[#2A3433]">أحدث بنوك الأسئلة</h2>
          </div>
          {recentBanks.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">لا توجد بنوك أسئلة مرتبطة بعد</p>
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
