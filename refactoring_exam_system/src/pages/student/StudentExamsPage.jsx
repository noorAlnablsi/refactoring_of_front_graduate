import { useTranslation } from 'react-i18next'
import { Clock3, History } from 'lucide-react'
import ExamCenterAvailableCard from '../../components/student/exams/ExamCenterAvailableCard'
import ExamCenterRecentCard from '../../components/student/exams/ExamCenterRecentCard'
import { useStudentExamCenter } from '../../hooks/student/useStudentExamCenter'
import { useAuthStore } from '../../store/authStore'

function StudentExamsPage() {
  const { t } = useTranslation('student')
  const user = useAuthStore((s) => s.user)
  const { tab, setTab, loading, error, availableExams, recentExams, refetch } = useStudentExamCenter()

  const fullName = user?.full_name?.trim() || t('portal.defaultName')
  const firstName = fullName.split(/\s+/)[0] || fullName
  const availableCount = availableExams.length

  const greeting =
    availableCount > 0
      ? t('examCenter.greeting.withCount', { name: firstName, count: availableCount })
      : t('examCenter.greeting.empty', { name: firstName })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-[28px]">{t('examCenter.title')}</h1>
        <p className="mt-2 text-sm leading-7 text-[#64748B]">{greeting}</p>
      </header>

      <div className="flex items-center gap-6 border-b border-[#E5E9EB]">
        <button
          type="button"
          onClick={() => setTab('available')}
          className={`relative inline-flex items-center gap-2 pb-3 text-sm font-bold transition ${
            tab === 'available' ? 'text-[#2AA8A2]' : 'text-[#64748B] hover:text-[#2A3433]'
          }`}
        >
          <Clock3 className="h-4 w-4" strokeWidth={2} />
          {t('examCenter.tabs.available')}
          {tab === 'available' ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab('recent')}
          className={`relative inline-flex items-center gap-2 pb-3 text-sm font-bold transition ${
            tab === 'recent' ? 'text-[#2AA8A2]' : 'text-[#64748B] hover:text-[#2A3433]'
          }`}
        >
          <History className="h-4 w-4" strokeWidth={2} />
          {t('examCenter.tabs.recent')}
          {tab === 'recent' ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
          ) : null}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 font-bold text-[#2AA8A2]"
          >
            {t('examCenter.retry')}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-64 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : tab === 'available' ? (
        availableExams.length === 0 ? (
          <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-[#64748B] ring-1 ring-[#E5E9EB]">
            {t('examCenter.empty.available')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availableExams.map((exam) => (
              <ExamCenterAvailableCard key={exam.id} exam={exam} />
            ))}
          </div>
        )
      ) : recentExams.length === 0 ? (
        <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-[#64748B] ring-1 ring-[#E5E9EB]">
          {t('examCenter.empty.recent')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentExams.map((exam) => (
            <ExamCenterRecentCard key={exam.key} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentExamsPage
