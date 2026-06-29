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
import { canAccessQuestionBanks, canAccessSubjectsModule, canAccessExams } from '../../lib/workspaceContext'
import { useAuthStore } from '../../store/authStore'

const baseNavItems = [
  { to: ROUTES.DASHBOARD, label: 'لوحة التحكم', icon: LayoutGrid, end: true },
  { to: ROUTES.SUBJECTS, label: 'إدارة المواد', icon: BookOpen, end: false, requiresSubjectsModule: true },
  { to: ROUTES.QUESTION_BANKS, label: 'بنوك الأسئلة', icon: FileQuestion, end: false, requiresQuestionBanks: true },
  { to: ROUTES.EXAMS, label: 'الامتحانات', icon: ClipboardList, end: false, requiresExams: true },
  { to: '#', label: 'الإحصائيات', icon: BarChart3, disabled: true },
  { to: '#', label: 'الإعدادات', icon: Settings, disabled: true },
]

function SidebarBrand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#E5E9EB] px-6">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#D1FAE5]"
        style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
        aria-hidden="true"
      >
        <GraduationCap className="h-4 w-4 text-[#2AA8A2]" strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-base font-semibold leading-tight text-[#2AA8A2]">QuizHub</p>
        <p className="mt-0.5 text-[11px] font-normal uppercase leading-tight text-[#6B7280]">
          Admin Dashboard
        </p>
      </div>
    </div>
  )
}

function Sidebar() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navItems = baseNavItems.filter((item) => {
    if (item.requiresSubjectsModule && !canAccessSubjectsModule()) return false
    if (item.requiresExams && !canAccessExams()) return false
    if (!item.requiresQuestionBanks) return true
    return canAccessQuestionBanks()
  })

  const handleLogout = () => {
    clearAuth()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-l border-[#E5E9EB] bg-white lg:flex">
      <SidebarBrand />

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map(({ to, label, icon: Icon, end = true, disabled }) =>
          disabled ? (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#CBD5E1]"
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
                    ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                    : 'text-[#64748B] hover:bg-[#F6F8F9]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute inset-y-2.5 right-0 w-1 rounded-full bg-[#2AA8A2]" />
                  ) : null}
                  <Icon className="h-5 w-5" />
                  {label}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-[#E5E9EB] px-4 py-5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#64748B] transition hover:bg-[#F6F8F9] hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
