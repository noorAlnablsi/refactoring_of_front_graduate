import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import ExamCard from '../../components/exams/ExamCard'
import { ROUTES } from '../../constants/routes'
import { TEST_TABS } from '../../constants/tests'
import { useTests } from '../../hooks/tests/useTests'
import { showAppToast } from '../../lib/appToast'
import { canAccessExams, canCreateExam } from '../../lib/workspaceContext'
import { getTestId, getTestName } from '../../lib/testModel'
import { archiveTest, closeTest, deleteTest } from '../../services/tests.service'
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

function ExamsPage() {
  const { t } = useTranslation(['exams', 'common'])
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const tabs = useMemo(
    () => [
      { id: TEST_TABS.ALL, label: t('tabs.all', { ns: 'exams' }) },
      { id: TEST_TABS.PUBLISHED, label: t('tabs.published', { ns: 'exams' }) },
      { id: TEST_TABS.CORRECTED, label: t('tabs.corrected', { ns: 'exams' }) },
      { id: TEST_TABS.DRAFTS, label: t('tabs.drafts', { ns: 'exams' }) },
    ],
    [t],
  )
  const [activeTab, setActiveTab] = useState(TEST_TABS.ALL)
  const { filteredTests, loading, error, search, setSearch, refetch } = useTests(activeTab)
  const [actionLoading, setActionLoading] = useState(false)

  if (!canAccessExams()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleArchive = async (test) => {
    const name = getTestName(test)
    if (!window.confirm(t('confirm.archive', { ns: 'exams', name }))) return
    setActionLoading(true)
    try {
      await archiveTest(getTestId(test))
      showAppToast('toast.archived', 'success', { ns: 'exams' })
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async (test) => {
    const name = getTestName(test)
    if (!window.confirm(t('confirm.close', { ns: 'exams', name }))) return
    setActionLoading(true)
    try {
      await closeTest(getTestId(test))
      showAppToast('toast.closed', 'success', { ns: 'exams' })
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (test) => {
    const name = getTestName(test)
    if (!window.confirm(t('confirm.delete', { ns: 'exams', name }))) return
    setActionLoading(true)
    try {
      await deleteTest(getTestId(test))
      showAppToast('toast.deleted', 'success', { ns: 'exams' })
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
          <p className={shellPageEyebrowClass}>{t('page.eyebrow', { ns: 'exams' })}</p>
          <h1 className={`mt-1 text-4xl ${shellPageTitleClass}`}>{t('page.title', { ns: 'exams' })}</h1>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('page.subtitle', { ns: 'exams' })}</p>
        </div>
        {canCreateExam() ? (
          <button type="button" onClick={() => navigate(ROUTES.EXAM_CREATE)} className={shellAccentButtonClass}>
            <Plus className="h-4 w-4" />
            {t('page.createExam', { ns: 'exams' })}
          </button>
        ) : null}
      </div>

      <div className={shellTabsBarClass}>
        {tabs.map((tab) => (
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
            placeholder={t('page.searchPlaceholder', { ns: 'exams' })}
            className={shellSearchInputClass}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {actionLoading ? (
        <p className={shellSubtleTextClass}>{t('page.processing', { ns: 'exams' })}</p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`shell-skeleton h-48 animate-pulse ${shellCardClass}`} />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className={`p-12 text-center ${shellCardClass}`}>
          <p className={`text-lg ${shellPageTitleClass}`}>{t('page.empty', { ns: 'exams' })}</p>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>
            {search.trim()
              ? t('page.emptySearch', { ns: 'exams' })
              : t('page.emptyHint', { ns: 'exams' })}
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
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamsPage
