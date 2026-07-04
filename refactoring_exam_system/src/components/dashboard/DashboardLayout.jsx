import { Outlet } from 'react-router-dom'
import Toast from '../common/Toast'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function DashboardLayout() {
  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-[#F6F8F9] font-sans text-[#1F2533]">
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
