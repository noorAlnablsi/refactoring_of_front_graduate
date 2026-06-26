import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import ExamCard from '../../components/exams/ExamCard'
import { ROUTES } from '../../constants/routes'
import { TEST_TABS } from '../../constants/tests'
import { useTests } from '../../hooks/tests/useTests'
import { canAccessExams, canCreateExam } from '../../lib/workspaceContext'
import { getTestId, getTestName } from '../../lib/testModel'
import { archiveTest, closeTest } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

const TABS = [
  { id: TEST_TABS.ALL, label: 'الكل' },
  { id: TEST_TABS.PUBLISHED, label: 'المنشورة' },
  { id: TEST_TABS.CORRECTED, label: 'المصححة' },
  { id: TEST_TABS.DRAFTS, label: 'المسودات' },
]

function ExamsPage() {
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const [activeTab, setActiveTab] = useState(TEST_TABS.ALL)
  const { filteredTests, loading, error, search, setSearch, refetch } = useTests(activeTab)
  const [actionLoading, setActionLoading] = useState(false)

  if (!canAccessExams()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleArchive = async (test) => {
    if (!window.confirm(`أرشفة الامتحان "${getTestName(test)}"؟`)) return
    setActionLoading(true)
    try {
      await archiveTest(getTestId(test))
      showToast('تمت أرشفة الامتحان')
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async (test) => {
    if (!window.confirm(`إغلاق الامتحان "${getTestName(test)}"؟`)) return
    setActionLoading(true)
    try {
      await closeTest(getTestId(test))
      showToast('تم إغلاق الامتحان')
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#2AA8A2]">المشروع الأكاديمي</p>
          <h1 className="mt-1 text-4xl font-extrabold text-[#2A3433]">الامتحانات</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            أنشئ وادِر امتحاناتك الإلكترونية من المسودة حتى النشر والتصحيح.
          </p>
        </div>
        {canCreateExam() ? (
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXAM_CREATE)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.22)]"
          >
            <Plus className="h-4 w-4" />
            إنشاء امتحان جديد
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-6 border-b border-[#E5E9EB]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-3 text-sm font-bold ${
              activeTab === tab.id ? 'text-[#2AA8A2]' : 'text-[#64748B]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#E5E9EB]">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في الامتحانات..."
            className="h-11 w-full rounded-xl bg-[#F6F8F9] pr-10 pl-4 text-sm outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/30"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {actionLoading ? <p className="text-sm text-[#94A3B8]">جاري المعالجة...</p> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-[#E5E9EB]" />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E5E9EB]">
          <p className="text-lg font-extrabold text-[#2A3433]">لا توجد امتحانات</p>
          <p className="mt-2 text-sm text-[#64748B]">
            {search.trim() ? 'لا توجد نتائج مطابقة للبحث.' : 'ابدأ بإنشاء امتحانك الأول.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTests.map((test) => (
            <ExamCard
              key={getTestId(test)}
              test={test}
              onArchive={handleArchive}
              onClose={handleClose}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamsPage
