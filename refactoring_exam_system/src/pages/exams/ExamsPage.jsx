import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import ConfirmActionDialog from '../../components/common/ConfirmActionDialog'
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

const EXAM_ACTION = {
  ARCHIVE: 'archive',
  CLOSE: 'close',
  DELETE: 'delete',
}

function ExamsPage() {
  const { t } = useTranslation(['exams', 'common'])
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const tabs = [
    { id: TEST_TABS.ALL, label: t('tabs.all', { ns: 'exams' }) },
    { id: TEST_TABS.PUBLISHED, label: t('tabs.published', { ns: 'exams' }) },
    { id: TEST_TABS.CORRECTED, label: t('tabs.corrected', { ns: 'exams' }) },
    { id: TEST_TABS.DRAFTS, label: t('tabs.drafts', { ns: 'exams' }) },
  ]
  const [activeTab, setActiveTab] = useState(TEST_TABS.ALL)
  const { filteredTests, loading, error, search, setSearch, refetch } = useTests(activeTab)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const allowed = canAccessExams()

  const closeConfirm = () => {
    if (actionLoading) return
    setPendingAction(null)
  }

  const handleConfirmAction = async () => {
    if (!pendingAction?.test || !pendingAction?.type) return
    const { test, type } = pendingAction
    const id = getTestId(test)
    setActionLoading(true)
    try {
      if (type === EXAM_ACTION.ARCHIVE) {
        await archiveTest(id)
        showAppToast('toast.archived', 'success', { ns: 'exams' })
      } else if (type === EXAM_ACTION.CLOSE) {
        await closeTest(id)
        showAppToast('toast.closed', 'success', { ns: 'exams' })
      } else if (type === EXAM_ACTION.DELETE) {
        await deleteTest(id)
        showAppToast('toast.deleted', 'success', { ns: 'exams' })
      }
      setPendingAction(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  if (!allowed) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const pendingName = pendingAction?.test ? getTestName(pendingAction.test) : ''
  const dialogTone =
    pendingAction?.type === EXAM_ACTION.DELETE ? 'danger' : 'accent'

  let dialogTitle = ''
  let dialogMessage = ''
  let dialogNote = ''
  let dialogConfirmLabel = ''
  let dialogLoadingLabel = t('loading.processing', { ns: 'common' })

  if (pendingAction?.type === EXAM_ACTION.ARCHIVE) {
    dialogTitle = t('confirm.archiveTitle', { ns: 'exams' })
    dialogMessage = t('confirm.archiveMessage', { ns: 'exams' })
    dialogNote = t('confirm.archiveNote', { ns: 'exams' })
    dialogConfirmLabel = t('card.archive', { ns: 'exams' })
  } else if (pendingAction?.type === EXAM_ACTION.CLOSE) {
    dialogTitle = t('confirm.closeTitle', { ns: 'exams' })
    dialogMessage = t('confirm.closeMessage', { ns: 'exams' })
    dialogNote = t('confirm.closeNote', { ns: 'exams' })
    dialogConfirmLabel = t('card.closeExam', { ns: 'exams' })
  } else if (pendingAction?.type === EXAM_ACTION.DELETE) {
    dialogTitle = t('confirm.deleteTitle', { ns: 'exams' })
    dialogMessage = t('confirm.deleteMessage', { ns: 'exams' })
    dialogNote = t('confirm.deleteNote', { ns: 'exams' })
    dialogConfirmLabel = t('card.delete', { ns: 'exams' })
    dialogLoadingLabel = t('loading.deleting', { ns: 'common' })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={shellPageEyebrowClass}>{t('page.eyebrow', { ns: 'exams' })}</p>
          <h1 className={`mt-1 text-3xl sm:text-4xl ${shellPageTitleClass}`}>{t('page.title', { ns: 'exams' })}</h1>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('page.subtitle', { ns: 'exams' })}</p>
        </div>
        {canCreateExam() ? (
          <button type="button" onClick={() => navigate(ROUTES.EXAM_CREATE)} className={shellAccentButtonClass}>
            <Plus className="h-4 w-4" />
            {t('page.createExam', { ns: 'exams' })}
          </button>
        ) : null}
      </div>

      <div className={`${shellTabsBarClass} gap-4 overflow-x-auto`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 ${shellTabButtonClass(activeTab === tab.id)}`}
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
              onArchive={(item) => setPendingAction({ type: EXAM_ACTION.ARCHIVE, test: item })}
              onClose={(item) => setPendingAction({ type: EXAM_ACTION.CLOSE, test: item })}
              onDelete={(item) => setPendingAction({ type: EXAM_ACTION.DELETE, test: item })}
            />
          ))}
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title={dialogTitle}
        message={dialogMessage}
        note={dialogNote}
        itemLabel={t('confirm.itemLabel', { ns: 'exams' })}
        itemName={pendingName}
        confirmLabel={dialogConfirmLabel}
        loadingLabel={dialogLoadingLabel}
        confirmTone={dialogTone}
        loading={actionLoading}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}

export default ExamsPage
