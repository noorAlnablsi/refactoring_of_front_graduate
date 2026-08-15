import { LogOut } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { useLogout } from '../../hooks/useLogout'

function SidebarSessionLogout({ className = '', onNavigate }) {
  const { t } = useAppTranslation('auth')
  const { logoutSession, loading } = useLogout()

  const handleClick = () => {
    onNavigate?.()
    void logoutSession()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-5 w-5" />
      {loading ? t('logout.submitting') : t('logout.currentSession')}
    </button>
  )
}

export default SidebarSessionLogout
