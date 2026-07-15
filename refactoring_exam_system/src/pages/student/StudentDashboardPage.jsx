import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import AvailableExamsSection from '../../components/student/dashboard/AvailableExamsSection'
import LatestResultsSection from '../../components/student/dashboard/LatestResultsSection'
import StudentCalendarCard from '../../components/student/dashboard/StudentCalendarCard'
import StudentStatsCards from '../../components/student/dashboard/StudentStatsCards'
import UpcomingExamsSection from '../../components/student/dashboard/UpcomingExamsSection'
import WelcomeSection from '../../components/student/dashboard/WelcomeSection'
import { useStudentDashboard } from '../../hooks/student/useStudentDashboard'

function StudentDashboardPage() {
  const { t } = useTranslation('student')
  const user = useAuthStore((s) => s.user)
  const {
    loading,
    error,
    stats,
    availableExams,
    upcomingExams,
    latestResults,
    getEventDaysForMonth,
    refetch,
  } = useStudentDashboard()

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#94A3B8]">{t('dashboard.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-[#E5E9EB]">
        <p className="text-sm font-bold text-[#DC2626]">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-4 rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white"
        >
          {t('dashboard.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WelcomeSection name={user?.full_name} />
      <StudentStatsCards stats={stats} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="min-w-0 space-y-6">
          <AvailableExamsSection exams={availableExams} />
          <LatestResultsSection results={latestResults} />
        </div>
        <aside className="w-full space-y-4 lg:w-[288px] lg:shrink-0">
          <StudentCalendarCard getEventDaysForMonth={getEventDaysForMonth} />
          <UpcomingExamsSection exams={upcomingExams} />
        </aside>
      </div>
    </div>
  )
}

export default StudentDashboardPage
