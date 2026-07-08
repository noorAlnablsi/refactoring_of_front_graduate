import { Outlet } from 'react-router-dom'
import Toast from '../../common/Toast'
import StudentSidebar from './StudentSidebar'
import StudentTopBar from './StudentTopBar'

function StudentDashboardLayout() {
  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-[#F6F8F9] font-sans text-[#1F2533]">
      <StudentSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <StudentTopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default StudentDashboardLayout
