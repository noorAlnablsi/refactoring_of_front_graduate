import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, LayoutGrid, UserPlus } from 'lucide-react'
import WorkspaceDashboardQuestionBanks from '../components/dashboard/WorkspaceDashboardQuestionBanks'
import WorkspaceDashboardRecentMembers from '../components/dashboard/WorkspaceDashboardRecentMembers'
import WorkspaceDashboardStats from '../components/dashboard/WorkspaceDashboardStats'
import WorkspaceDashboardSubjectsCard from '../components/dashboard/WorkspaceDashboardSubjectsCard'
import WorkspaceDashboardTrendChart from '../components/dashboard/WorkspaceDashboardTrendChart'
import WorkspaceDashboardUpcomingExams from '../components/dashboard/WorkspaceDashboardUpcomingExams'
import SendInviteModal from '../components/invites/SendInviteModal'
import CreateSubjectModal from '../components/subjects/CreateSubjectModal'
import { ROUTES } from '../constants/routes'
import { useWorkspaceDashboard } from '../hooks/useWorkspaceDashboard'
import {
  shellBodyTextClass,
  shellCardInteractiveClass,
  shellIconWrapClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSectionTitleClass,
} from '../lib/shellUi'
import { canAccessSubjectsModule, canSendInvites, getActiveMembership } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

function StaffFallbackDashboard({ greeting }) {
  const { t } = useTranslation('dashboard')
  const showSubjectsCard = canAccessSubjectsModule()
  const showInviteCard = canSendInvites()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className={`text-2xl md:text-3xl ${shellPageTitleClass}`}>{t('title')}</h1>
        <p className={`mt-2 ${shellPageSubtitleClass}`}>{greeting}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showSubjectsCard ? (
          <Link to={ROUTES.SUBJECTS} className={`flex items-center gap-4 p-6 ${shellCardInteractiveClass}`}>
            <span className={`h-12 w-12 ${shellIconWrapClass}`}>
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <p className={shellSectionTitleClass}>{t('subjects.title')}</p>
              <p className={shellBodyTextClass}>{t('subjects.description')}</p>
            </div>
          </Link>
        ) : null}

        {showInviteCard ? (
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className={`flex items-center gap-4 p-6 text-right ${shellCardInteractiveClass}`}
          >
            <span className={`h-12 w-12 ${shellIconWrapClass}`}>
              <UserPlus className="h-6 w-6" />
            </span>
            <div>
              <p className={shellSectionTitleClass}>{t('invite.title')}</p>
              <p className={shellBodyTextClass}>{t('invite.description')}</p>
            </div>
          </button>
        ) : null}

        <div className={`flex items-center gap-4 p-6 opacity-60 ${shellCardInteractiveClass}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shell-hover)] text-[var(--shell-text-muted)]">
            <LayoutGrid className="h-6 w-6" />
          </span>
          <div>
            <p className={shellSectionTitleClass}>{t('otherModules.title')}</p>
            <p className={shellBodyTextClass}>{t('otherModules.comingSoon')}</p>
          </div>
        </div>
      </div>

      <SendInviteModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  )
}

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false)
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
    const fallbackGreeting =
      workspaceName && workspaceName !== fullName
        ? t('greetingWithWorkspace', { name: fullName, workspace: workspaceName })
        : t('greeting', { name: fullName })
    return <StaffFallbackDashboard greeting={fallbackGreeting} />
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className={`text-2xl md:text-[28px] ${shellPageTitleClass}`}>{greeting}</h1>
        <p className={`mt-2 max-w-3xl ${shellPageSubtitleClass}`}>{subtitle}</p>
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
