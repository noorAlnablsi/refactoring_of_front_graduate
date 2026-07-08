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
import {
  shellAccentButtonClass,
  shellCardClass,
  shellPageEyebrowClass,
  shellPageSubtitleClass,
  shellPageTitleClass,
  shellSearchInputClass,
  shellSubtleTextClass,
  shellTabButtonClass,
  shellTabIndicatorClass,
  shellTabsBarClass,
} from '../../lib/shellUi'

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
          <p className={shellPageEyebrowClass}>المشروع الأكاديمي</p>
          <h1 className={`mt-1 text-4xl ${shellPageTitleClass}`}>الامتحانات</h1>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>
            أنشئ وادِر امتحاناتك الإلكترونية من المسودة حتى النشر والتصحيح.
          </p>
        </div>
        {canCreateExam() ? (
          <button type="button" onClick={() => navigate(ROUTES.EXAM_CREATE)} className={shellAccentButtonClass}>
            <Plus className="h-4 w-4" />
            إنشاء امتحان جديد
          </button>
        ) : null}
      </div>

      <div className={shellTabsBarClass}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={shellTabButtonClass(activeTab === tab.id)}
          >
            {tab.label}
            {activeTab === tab.id ? <span className={shellTabIndicatorClass} /> : null}
          </button>
        ))}
      </div>

      <div className={`p-4 ${shellCardClass}`}>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في الامتحانات..."
            className={shellSearchInputClass}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {actionLoading ? <p className={shellSubtleTextClass}>جاري المعالجة...</p> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`shell-skeleton h-48 animate-pulse ${shellCardClass}`} />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className={`p-12 text-center ${shellCardClass}`}>
          <p className={`text-lg ${shellPageTitleClass}`}>لا توجد امتحانات</p>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>
            {search.trim() ? 'لا توجد نتائج مطابقة للبحث.' : 'ابدأ بإنشاء امتحانك الأول.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTests.map((test) => (
            <ExamCard key={getTestId(test)} test={test} onArchive={handleArchive} onClose={handleClose} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamsPage
