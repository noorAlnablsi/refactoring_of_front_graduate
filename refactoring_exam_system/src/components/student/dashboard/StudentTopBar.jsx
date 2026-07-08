import { Bell, Search } from 'lucide-react'
import { getActiveMembership } from '../../../lib/workspaceContext'
import { useAuthStore } from '../../../store/authStore'
import UserAvatar from '../../dashboard/UserAvatar'

function StudentTopBar() {
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name || 'QuizHub'

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-[#E5E9EB] bg-white px-6 lg:px-[37px]">
      <div className="flex w-full items-center gap-4 lg:gap-6">
        <p className="hidden shrink-0 text-sm font-bold text-[#2AA8A2] md:block">{workspaceName}</p>

        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            strokeWidth={2}
          />
          <input
            type="search"
            dir="rtl"
            placeholder="البحث عن الاختبارات، المواد أو النتائج..."
            className="h-9 w-full rounded-full border-0 bg-[#F1F5F9] pt-[3px] pr-10 pb-1 pl-4 text-sm text-[#374151] outline-none placeholder:text-sm placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/25"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="relative flex items-center justify-center text-[#6B7280]"
            aria-label="إشعارات"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>

          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-medium leading-tight text-[#2AA8A2]">
                {user?.full_name || 'طالب'}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                ملف الطالب
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default StudentTopBar
