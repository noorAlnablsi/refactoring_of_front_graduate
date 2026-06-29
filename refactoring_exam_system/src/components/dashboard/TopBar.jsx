import { Bell, HelpCircle, Search } from 'lucide-react'
import { getActiveMembership } from '../../lib/workspaceContext'
import { getMembershipShortLabel } from '../../lib/membershipLabel'
import { useAuthStore } from '../../store/authStore'
import UserAvatar from './UserAvatar'

function TopBar({ searchPlaceholder = 'البحث في المنصة...' }) {
  const user = useAuthStore((s) => s.user)
  const membership = getActiveMembership()
  const roleLabel = getMembershipShortLabel(membership)

  return (
    <header className="flex h-16 shrink-0 items-center bg-white px-[37px]">
      <div dir="ltr" className="flex w-full items-center gap-6">
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="xs" rounded />
            <div className="text-left">
              <p className="truncate text-sm font-medium leading-tight text-[#2AA8A2]">
                {user?.full_name || 'مستخدم'}
              </p>
              {roleLabel ? (
                <p className="mt-0.5 truncate text-xs font-normal leading-tight text-[#6B7280]">
                  {roleLabel}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="relative flex shrink-0 items-center justify-center text-[#6B7280]"
            aria-label="مساعدة"
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>

          <button
            type="button"
            className="relative flex shrink-0 items-center justify-center text-[#6B7280]"
            aria-label="إشعارات"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 justify-end">
          <div className="relative w-full max-w-[609px]">
            <Search
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
              strokeWidth={2}
            />
            <input
              type="search"
              dir="rtl"
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-full border-0 bg-[#F1F5F9] pt-[3px] pr-10 pb-1 pl-4 text-sm text-[#374151] outline-none placeholder:text-sm placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#2AA8A2]/25"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
