import { LogOut } from 'lucide-react'
import { useLogout } from '../../hooks/useLogout'

function SidebarSessionLogout({ className = '' }) {
  const { logoutSession, loading } = useLogout()

  return (
    <button
      type="button"
      onClick={logoutSession}
      disabled={loading}
      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-5 w-5" />
      {loading ? 'جاري الخروج...' : 'خروج من المسار الحالي'}
    </button>
  )
}

export default SidebarSessionLogout
