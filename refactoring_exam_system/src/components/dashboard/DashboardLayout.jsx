import { Outlet } from 'react-router-dom'
import Toast from '../common/Toast'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function DashboardLayout() {
  return (
    <div dir="rtl" className="flex min-h-screen bg-[#F6F8F9] font-sans text-[#1F2533]">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default DashboardLayout
