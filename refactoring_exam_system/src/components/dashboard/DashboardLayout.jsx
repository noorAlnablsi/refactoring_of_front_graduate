import { Outlet } from 'react-router-dom'
import Toast from '../common/Toast'
import { getLanguageDirection } from '../../lib/language'
import { useLanguageStore } from '../../store/languageStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function DashboardLayout() {
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)

  return (
    <div
      dir={dir}
      data-app-shell="dashboard"
      className="flex h-screen overflow-hidden bg-[var(--shell-bg)] font-sans text-[var(--shell-text)]"
    >
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default DashboardLayout
