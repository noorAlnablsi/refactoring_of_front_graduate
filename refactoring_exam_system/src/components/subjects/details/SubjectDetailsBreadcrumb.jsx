import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

function SubjectDetailsBreadcrumb() {
  return (
    <nav className="text-sm" aria-label="مسار التنقل">
      <Link to={ROUTES.SUBJECTS} className="font-semibold text-[#2AA8A2] transition hover:opacity-80">
        إدارة المواد
      </Link>
      <span className="mx-2 text-[#CBD5E1]">›</span>
      <span className="font-medium text-[#64748B]">تفاصيل المادة</span>
    </nav>
  )
}

export default SubjectDetailsBreadcrumb
