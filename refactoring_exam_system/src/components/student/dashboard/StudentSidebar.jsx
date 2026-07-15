import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  Settings,
  Star,
} from 'lucide-react'
import SidebarSessionLogout from '../../auth/SidebarSessionLogout'
import { ROUTES } from '../../../constants/routes'
import { getActiveMembership } from '../../../lib/workspaceContext'

function StudentSidebar() {
  const { t } = useTranslation(['student', 'auth'])
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name || t('brand.quizHub', { ns: 'auth' })

  const navItems = [
    { to: ROUTES.STUDENT_DASHBOARD, labelKey: 'sidebar.home', icon: LayoutGrid, end: true },
    { to: ROUTES.STUDENT_EXAMS, labelKey: 'sidebar.exams', icon: ClipboardList, end: false },
    { to: ROUTES.STUDENT_RESULTS, labelKey: 'sidebar.results', icon: Star, end: false },
    { to: ROUTES.STUDENT_SETTINGS, labelKey: 'sidebar.settings', icon: Settings, end: false },
  ]

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-l border-[#E5E9EB] bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#E5E9EB] px-6">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#D1FAE5]"
          style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
          aria-hidden="true"
        >
          <GraduationCap className="h-4 w-4 text-[#2AA8A2]" strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-base font-semibold leading-tight text-[#2AA8A2]">{t('portal.title')}</p>
          <p className="mt-0.5 text-[11px] font-normal leading-tight text-[#6B7280]">{workspaceName}</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                isActive ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'text-[#64748B] hover:bg-[#F6F8F9]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span className="absolute inset-y-2.5 right-0 w-1 rounded-full bg-[#2AA8A2]" />
                ) : null}
                <Icon className="h-5 w-5" />
                {t(labelKey)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#E5E9EB] px-4 py-5">
        <SidebarSessionLogout className="text-[#64748B] hover:bg-[#F6F8F9] hover:text-[#2AA8A2]" />
      </div>
    </aside>
  )
}

export default StudentSidebar
