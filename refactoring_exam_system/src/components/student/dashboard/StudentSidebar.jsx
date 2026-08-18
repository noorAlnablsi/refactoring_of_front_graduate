import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  ListChecks,
  Settings,
  Star,
} from 'lucide-react'
import SidebarSessionLogout from '../../auth/SidebarSessionLogout'
import MobileNavDrawer from '../../common/MobileNavDrawer'
import { ROUTES } from '../../../constants/routes'
import { getActiveMembership } from '../../../lib/workspaceContext'

const studentNavItems = [
  { to: ROUTES.STUDENT_DASHBOARD, labelKey: 'sidebar.home', icon: LayoutGrid, end: true },
  { to: ROUTES.STUDENT_EXAMS, labelKey: 'sidebar.exams', icon: ClipboardList, end: false },
  { to: ROUTES.STUDENT_SURVEYS, labelKey: 'sidebar.surveys', icon: ListChecks, end: false },
  { to: ROUTES.STUDENT_RESULTS, labelKey: 'sidebar.results', icon: Star, end: false },
  { to: ROUTES.STUDENT_SETTINGS, labelKey: 'sidebar.settings', icon: Settings, end: false },
]

function StudentSidebarBrand() {
  const { t } = useTranslation(['student', 'auth'])
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name || t('brand.quizHub', { ns: 'auth' })

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
        <p className="text-base font-semibold leading-tight text-[var(--shell-accent)]">
          {t('portal.title')}
        </p>
        <p className="mt-0.5 text-[11px] font-normal leading-tight text-[var(--shell-text-muted)]">
          {workspaceName}
        </p>
      </div>
    </div>
  )
}

function StudentSidebarNav({ onNavigate, showBrand = true }) {
  const { t } = useTranslation('student')

  return (
    <>
      {showBrand ? <StudentSidebarBrand /> : null}

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {studentNavItems.map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => onNavigate?.()}
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
                {t(labelKey)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--shell-border)] px-4 py-5">
        <SidebarSessionLogout
          className="text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-accent)]"
          onNavigate={onNavigate}
        />
      </div>
    </>
  )
}

function StudentSidebar({ mobileOpen = false, onMobileClose }) {
  const { t } = useTranslation(['student', 'navigation'])

  return (
    <>
      <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-e border-[var(--shell-border)] bg-[var(--shell-surface)] lg:flex">
        <StudentSidebarNav />
      </aside>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={onMobileClose}
        title={t('portal.title')}
        closeLabel={t('topBar.closeMenu', { ns: 'navigation' })}
        widthClassName="w-[min(260px,85vw)]"
      >
        <StudentSidebarNav onNavigate={onMobileClose} showBrand={false} />
      </MobileNavDrawer>
    </>
  )
}

export default StudentSidebar
