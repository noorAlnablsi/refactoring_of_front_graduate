import { Bell, HelpCircle, Search } from 'lucide-react'
import { getActiveMembership } from '../../lib/workspaceContext'
import { useAuthStore } from '../../store/authStore'

function TopBar({ searchPlaceholder = 'البحث في المواد الدراسية...' }) {
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E9EB] bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2AA8A2] text-sm font-bold text-white">
          {(user?.full_name || 'U').charAt(0)}
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#2A3433]">{user?.full_name || 'مستخدم'}</p>
          <p className="text-xs text-[#94A3B8]">{membership?.workspace?.name || ''}</p>
        </div>
        <button type="button" className="text-[#94A3B8]" aria-label="مساعدة">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button type="button" className="relative text-[#94A3B8]" aria-label="إشعارات">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-xl bg-[#F6F8F9] pr-10 pl-4 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/30"
        />
      </div>
    </header>
  )
}

export default TopBar
