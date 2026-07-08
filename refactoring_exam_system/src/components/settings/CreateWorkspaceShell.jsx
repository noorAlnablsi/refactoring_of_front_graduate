import { Link } from 'react-router-dom'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { ROUTES } from '../../constants/routes'

function CreateWorkspaceShell({ children }) {
  return (
    <main dir="rtl" className="flex min-h-screen flex-col bg-[#F6F8F9] font-sans text-[#1F2533]">
      <header className="border-b border-[#E5E7EB] bg-white px-4 py-4 md:px-10">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-4">
          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex items-center gap-3 text-[#2AA8A2] transition hover:opacity-90"
          >
            <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            <span>
              <span className="block text-base font-extrabold">إنشاء مساحة عمل</span>
              <span className="block text-xs font-semibold text-[#9CA3AF]">أكاديميك هب</span>
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] transition hover:text-[#2AA8A2]"
          >
            <HelpCircle className="h-4 w-4" />
            المساعدة
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-[640px]">{children}</div>
      </div>

      <footer className="border-t border-[#E5E7EB] bg-white px-4 py-6 md:px-10">
        <div className="mx-auto flex max-w-[960px] flex-col gap-4 text-xs text-[#6B7280] md:flex-row md:items-center md:justify-between">
          <div className="text-right">
            <p className="text-sm font-extrabold text-[#2AA8A2]">منصة الملاذ الأكاديمي</p>
            <p className="mt-1">© 2024 منصة الملاذ الأكاديمي، جميع الحقوق محفوظة.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a href="#" className="transition hover:text-[#2AA8A2]">
              شروط الخدمة
            </a>
            <a href="#" className="transition hover:text-[#2AA8A2]">
              سياسة الخصوصية
            </a>
            <a href="#" className="transition hover:text-[#2AA8A2]">
              اتصل بالدعم
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default CreateWorkspaceShell
