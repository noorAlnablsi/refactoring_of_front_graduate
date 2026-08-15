import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Toast from '../common/Toast'
import { getLanguageDirection } from '../../lib/language'
import { useLanguageStore } from '../../store/languageStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function DashboardLayout() {
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  return (
    <div
      dir={dir}
      data-app-shell="dashboard"
      className="flex h-screen overflow-hidden bg-[var(--shell-bg)] font-sans text-[var(--shell-text)]"
    >
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          menuOpen={mobileNavOpen}
          onMenuClick={() => setMobileNavOpen((open) => !open)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-5">
          <div className="mx-auto w-full min-w-0 max-w-[1180px]">
            <Outlet />
          </div>
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default DashboardLayout
