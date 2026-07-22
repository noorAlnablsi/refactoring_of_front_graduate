import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react'
import SidebarSessionLogout from '../auth/SidebarSessionLogout'
import { ROUTES } from '../../constants/routes'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import {
  canAccessMembersModule,
  canAccessQuestionBanks,
  canAccessSubjectsModule,
  canAccessExams,
} from '../../lib/workspaceContext'

const baseNavItems = [
  { to: ROUTES.DASHBOARD, labelKey: 'sidebar.dashboard', icon: LayoutGrid, end: true },
  {
    to: ROUTES.SUBJECTS,
    labelKey: 'sidebar.subjects',
    icon: BookOpen,
    end: false,
    requiresSubjectsModule: true,
  },
  { to: ROUTES.MEMBERS, labelKey: 'sidebar.members', icon: Users, end: true, requiresMembersModule: true },
  {
    to: ROUTES.QUESTION_BANKS,
    labelKey: 'sidebar.questionBanks',
    icon: FileQuestion,
    end: false,
    requiresQuestionBanks: true,
  },
  { to: ROUTES.EXAMS, labelKey: 'sidebar.exams', icon: ClipboardList, end: false, requiresExams: true },
  { to: '#', labelKey: 'sidebar.statistics', icon: BarChart3, disabled: true },
  { to: ROUTES.SETTINGS, labelKey: 'sidebar.settings', icon: Settings, end: true },
]

function SidebarBrand() {
  const { t } = useAppTranslation('navigation')

  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--shell-border)] px-6">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--shell-brand-bg)]"
        style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
        aria-hidden="true"
      >
        <GraduationCap className="h-4 w-4 text-[var(--shell-accent)]" strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-base font-semibold leading-tight text-[var(--shell-accent)]">QuizHub</p>
        <p className="mt-0.5 text-[11px] font-normal uppercase leading-tight text-[var(--shell-text-muted)]">
          {t('sidebar.brandSubtitle')}
        </p>
      </div>
    </div>
  )
}

function Sidebar() {
  const { t } = useAppTranslation('navigation')

  const navItems = baseNavItems.filter((item) => {
    if (item.requiresSubjectsModule && !canAccessSubjectsModule()) return false
    if (item.requiresMembersModule && !canAccessMembersModule()) return false
    if (item.requiresExams && !canAccessExams()) return false
    if (!item.requiresQuestionBanks) return true
    return canAccessQuestionBanks()
  })

  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-e border-[var(--shell-border)] bg-[var(--shell-surface)] lg:flex">
      <SidebarBrand />

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map(({ to, labelKey, icon: Icon, end = true, disabled }) => {
          const label = t(labelKey)

          return disabled ? (
            <span
              key={labelKey}
              className="flex cursor-not-allowed items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold text-[var(--shell-text-subtle)]"
            >
              <Icon className="h-5 w-5" />
              {label}
            </span>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'
                    : 'text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute inset-y-2.5 start-0 w-1 rounded-full bg-[var(--shell-accent)]" />
                  ) : null}
                  <Icon className="h-5 w-5" />
                  {label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-[var(--shell-border)] px-4 py-5">
        <SidebarSessionLogout className="text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-accent)]" />
      </div>
    </aside>
  )
}

export default Sidebar
