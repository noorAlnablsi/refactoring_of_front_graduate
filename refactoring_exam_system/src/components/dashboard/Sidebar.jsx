import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Settings,
} from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { canAccessQuestionBanks, canAccessSubjectsModule } from '../../lib/workspaceContext'
import { useAuthStore } from '../../store/authStore'

const baseNavItems = [
  { to: ROUTES.DASHBOARD, label: 'لوحة التحكم', icon: LayoutGrid, end: true },
  { to: ROUTES.SUBJECTS, label: 'إدارة المواد', icon: BookOpen, end: false, requiresSubjectsModule: true },
  { to: ROUTES.QUESTION_BANKS, label: 'بنوك الأسئلة', icon: FileQuestion, end: false, requiresQuestionBanks: true },
  { to: '#', label: 'الامتحانات', icon: ClipboardList, disabled: true },
  { to: '#', label: 'الإحصائيات', icon: BarChart3, disabled: true },
  { to: '#', label: 'الإعدادات', icon: Settings, disabled: true },
]

function Sidebar() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navItems = baseNavItems.filter((item) => {
    if (item.requiresSubjectsModule && !canAccessSubjectsModule()) return false
    if (!item.requiresQuestionBanks) return true
    return canAccessQuestionBanks()
  })

  const handleLogout = () => {
    clearAuth()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside className="hidden w-[260px] shrink-0 border-l border-[#E5E9EB] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#E5E9EB] px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-[#2A3433]">
              Quiz<span className="text-[#2AA8A2]">Hub</span>
            </p>
            <p className="text-xs text-[#94A3B8]">ADMIN DASHBOARD</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map(({ to, label, icon: Icon, end = true, disabled }) =>
          disabled ? (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#CBD5E1]"
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
                `relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                    : 'text-[#64748B] hover:bg-[#F6F8F9]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute inset-y-2 right-0 w-1 rounded-full bg-[#2AA8A2]" />
                  ) : null}
                  <Icon className="h-5 w-5" />
                  {label}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-[#E5E9EB] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-[#F6F8F9] hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
