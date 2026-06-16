import { Link } from 'react-router-dom'
import { BookOpen, LayoutGrid } from 'lucide-react'
import { ROUTES } from '../constants/routes'
import { canAccessSubjectsModule, getActiveMembership } from '../lib/workspaceContext'
import { useAuthStore } from '../store/authStore'

function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const showSubjectsCard = canAccessSubjectsModule()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2A3433] md:text-3xl">لوحة التحكم</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          مرحباً {user?.full_name || ''} — {membership?.workspace?.name || ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showSubjectsCard ? (
          <Link
            to={ROUTES.SUBJECTS}
            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E5E9EB] transition hover:ring-[#2AA8A2]/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold text-[#2A3433]">إدارة المواد</p>
              <p className="text-sm text-[#64748B]">إنشاء وإدارة المواد الدراسية</p>
            </div>
          </Link>
        ) : null}

        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 opacity-60 shadow-sm ring-1 ring-[#E5E9EB]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#64748B]">
            <LayoutGrid className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-[#2A3433]">وحدات أخرى</p>
            <p className="text-sm text-[#64748B]">قريباً</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
