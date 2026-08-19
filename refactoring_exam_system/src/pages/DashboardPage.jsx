import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'
import TeacherDashboardRecentTests from '../components/dashboard/TeacherDashboardRecentTests'
import TeacherDashboardStats from '../components/dashboard/TeacherDashboardStats'
import TeacherDashboardSubjects from '../components/dashboard/TeacherDashboardSubjects'
import TeacherDashboardWeakTopics from '../components/dashboard/TeacherDashboardWeakTopics'
import JoinCodeModal from '../components/dashboard/JoinCodeModal'
import WorkspaceDashboardQuestionBanks from '../components/dashboard/WorkspaceDashboardQuestionBanks'
import WorkspaceDashboardRecentMembers from '../components/dashboard/WorkspaceDashboardRecentMembers'
import WorkspaceDashboardStats from '../components/dashboard/WorkspaceDashboardStats'
import WorkspaceDashboardSubjectsCard from '../components/dashboard/WorkspaceDashboardSubjectsCard'
import WorkspaceDashboardTrendChart from '../components/dashboard/WorkspaceDashboardTrendChart'
import WorkspaceDashboardUpcomingExams from '../components/dashboard/WorkspaceDashboardUpcomingExams'
import CreateSubjectModal from '../components/subjects/CreateSubjectModal'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useWorkspaceDashboard } from '../hooks/useWorkspaceDashboard'
import { shellPageSubtitleClass, shellPageTitleClass } from '../lib/shellUi'
import { getActiveMembership } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

function TeacherScopedDashboard({ greeting, subtitle }) {
  const { t } = useTranslation('dashboard')
  const { t: tNav } = useTranslation('navigation')
  const [joinCodeOpen, setJoinCodeOpen] = useState(false)
  const { summary, subjects, upcomingTests, recentTests, loading, error, refetch } =
    useTeacherDashboard({ recent_limit: 5, upcoming_limit: 10 })

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{greeting}</h1>
          <p className={`mt-2 max-w-3xl ${shellPageSubtitleClass}`}>{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setJoinCodeOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#D4F0EE] bg-[#E8F7F6] px-4 py-2.5 text-sm font-semibold text-[#2AA8A2] transition hover:bg-[#D4F0EE]"
        >
          <KeyRound className="h-4 w-4" />
          {tNav('sidebar.joinCode')}
        </button>
        <JoinCodeModal open={joinCodeOpen} onClose={() => setJoinCodeOpen(false)} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 font-bold text-[var(--shell-accent)]"
          >
            {t('errors.retry')}
          </button>
        </div>
      ) : null}

      <TeacherDashboardStats summary={summary} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-2">
        <TeacherDashboardSubjects subjects={subjects} loading={loading} />
        <TeacherDashboardWeakTopics topics={summary?.weak_topics} loading={loading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.7fr)]">
        <TeacherDashboardRecentTests tests={recentTests} loading={loading} />
        <WorkspaceDashboardUpcomingExams tests={upcomingTests} loading={loading} />
      </div>
    </div>
  )
}

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { t: tNav } = useTranslation('navigation')
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false)
  const [joinCodeOpen, setJoinCodeOpen] = useState(false)
  const {
    canAccess,
    overview,
    performanceTrend,
    recentMembers,
    recentQuestionBanks,
    recentSubjects,
    upcomingTests,
    loading,
    error,
    refetch,
  } = useWorkspaceDashboard({ recent_limit: 3, upcoming_limit: 3 })

  const fullName = user?.full_name?.trim() || t('defaultUserName')
  const firstName = fullName.split(/\s+/)[0] || fullName
  const workspaceName = membership?.workspace?.name?.trim()
  const greeting = t('welcome.title', { name: firstName })
  const subtitle =
    workspaceName && workspaceName !== fullName
      ? t('welcome.subtitleWithWorkspace', { workspace: workspaceName })
      : t('welcome.subtitle')

  if (!canAccess) {
    return (
      <TeacherScopedDashboard
        greeting={greeting}
        subtitle={
          workspaceName && workspaceName !== fullName
            ? t('teacher.subtitleWithWorkspace', { workspace: workspaceName })
            : t('teacher.subtitle')
        }
      />
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{greeting}</h1>
          <p className={`mt-2 max-w-3xl ${shellPageSubtitleClass}`}>{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setJoinCodeOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#D4F0EE] bg-[#E8F7F6] px-4 py-2.5 text-sm font-semibold text-[#2AA8A2] transition hover:bg-[#D4F0EE]"
        >
          <KeyRound className="h-4 w-4" />
          {tNav('sidebar.joinCode')}
        </button>
        <JoinCodeModal open={joinCodeOpen} onClose={() => setJoinCodeOpen(false)} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 font-bold text-[var(--shell-accent)]"
          >
            {t('errors.retry')}
          </button>
        </div>
      ) : null}

      <WorkspaceDashboardStats overview={overview} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-3">
        <WorkspaceDashboardTrendChart
          trend={performanceTrend}
          averageScore={overview?.average_student_score}
          loading={loading}
        />
        <WorkspaceDashboardRecentMembers members={recentMembers} loading={loading} />
        <WorkspaceDashboardSubjectsCard
          totalSubjects={overview?.total_subjects}
          subjects={recentSubjects}
          loading={loading}
          onQuickAdd={() => setCreateSubjectOpen(true)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.7fr)]">
        <WorkspaceDashboardQuestionBanks banks={recentQuestionBanks} loading={loading} />
        <WorkspaceDashboardUpcomingExams tests={upcomingTests} loading={loading} />
      </div>

      <CreateSubjectModal
        open={createSubjectOpen}
        onClose={() => setCreateSubjectOpen(false)}
        onSuccess={() => {
          setCreateSubjectOpen(false)
          refetch()
        }}
      />
    </div>
  )
}

export default DashboardPage
