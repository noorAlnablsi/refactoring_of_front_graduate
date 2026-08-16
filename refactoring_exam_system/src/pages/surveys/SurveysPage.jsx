import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import ConfirmActionDialog from '../../components/common/ConfirmActionDialog'
import SubjectsPagination from '../../components/subjects/SubjectsPagination'
import AssignedSurveyCard from '../../components/surveys/AssignedSurveyCard'
import SurveyCard from '../../components/surveys/SurveyCard'
import { ROUTES } from '../../constants/routes'
import { TEST_TABS } from '../../constants/tests'
import { useAvailableSurveys } from '../../hooks/surveys/useAvailableSurveys'
import { useSurveys } from '../../hooks/surveys/useSurveys'
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

const SURVEY_SCOPE = {
  MANAGED: 'managed',
  ASSIGNED: 'assigned',
}

const SURVEY_ACTION = {
  ARCHIVE: 'archive',
  CLOSE: 'close',
  DELETE: 'delete',
}

const SURVEYS_PER_PAGE = 20

function SurveysPage() {
  const { t } = useTranslation(['surveys', 'common'])
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const scopeTabs = [
    { id: SURVEY_SCOPE.MANAGED, label: t('tabs.managed') },
    { id: SURVEY_SCOPE.ASSIGNED, label: t('tabs.assigned') },
  ]
  const tabs = [
    { id: TEST_TABS.ALL, label: t('tabs.all') },
    { id: TEST_TABS.PUBLISHED, label: t('tabs.published') },
    { id: TEST_TABS.DRAFTS, label: t('tabs.drafts') },
    { id: TEST_TABS.CLOSED, label: t('tabs.closed') },
  ]
  const [scope, setScope] = useState(SURVEY_SCOPE.MANAGED)
  const [activeTab, setActiveTab] = useState(TEST_TABS.ALL)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [assignedPage, setAssignedPage] = useState(1)
  const { filteredSurveys, pages, loading, error, refetch } = useSurveys(activeTab, {
    search,
    page,
    perPage: SURVEYS_PER_PAGE,
  })
  const {
    surveys: assignedSurveys,
    pages: assignedPages,
    loading: assignedLoading,
    error: assignedError,
  } = useAvailableSurveys({
    page: assignedPage,
    perPage: SURVEYS_PER_PAGE,
    enabled: scope === SURVEY_SCOPE.ASSIGNED,
  })
  const [pendingAction, setPendingAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const allowed = canAccessExams()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    setAssignedPage(1)
  }, [scope])

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
      if (type === SURVEY_ACTION.ARCHIVE) {
        await archiveTest(id)
        showAppToast('toast.archived', 'success', { ns: 'surveys' })
      } else if (type === SURVEY_ACTION.CLOSE) {
        await closeTest(id)
        showAppToast('toast.closed', 'success', { ns: 'surveys' })
      } else if (type === SURVEY_ACTION.DELETE) {
        await deleteTest(id)
        showAppToast('toast.deleted', 'success', { ns: 'surveys' })
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
  const dialogTone = pendingAction?.type === SURVEY_ACTION.DELETE ? 'danger' : 'accent'

  let dialogTitle = ''
  let dialogMessage = ''
  let dialogNote = ''
  let dialogConfirmLabel = ''
  let dialogLoadingLabel = t('loading.processing', { ns: 'common' })

  if (pendingAction?.type === SURVEY_ACTION.ARCHIVE) {
    dialogTitle = t('confirm.archiveTitle')
    dialogMessage = t('confirm.archiveMessage')
    dialogNote = t('confirm.archiveNote')
    dialogConfirmLabel = t('card.archive')
  } else if (pendingAction?.type === SURVEY_ACTION.CLOSE) {
    dialogTitle = t('confirm.closeTitle')
    dialogMessage = t('confirm.closeMessage')
    dialogNote = t('confirm.closeNote')
    dialogConfirmLabel = t('card.closeSurvey')
  } else if (pendingAction?.type === SURVEY_ACTION.DELETE) {
    dialogTitle = t('confirm.deleteTitle')
    dialogMessage = t('confirm.deleteMessage')
    dialogNote = t('confirm.deleteNote')
    dialogConfirmLabel = t('card.delete')
    dialogLoadingLabel = t('loading.deleting', { ns: 'common' })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={shellPageEyebrowClass}>{t('page.eyebrow')}</p>
          <h1 className={`mt-1 text-3xl sm:text-4xl ${shellPageTitleClass}`}>{t('page.title')}</h1>
          <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('page.subtitle')}</p>
        </div>
        {canCreateExam() ? (
          <button type="button" onClick={() => navigate(ROUTES.SURVEY_CREATE)} className={shellAccentButtonClass}>
            <Plus className="h-4 w-4" />
            {t('page.createSurvey')}
          </button>
        ) : null}
      </div>

      <div className={`${shellTabsBarClass} gap-4 overflow-x-auto`}>
        {scopeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setScope(tab.id)}
            className={`shrink-0 ${shellTabButtonClass(scope === tab.id)}`}
          >
            {tab.label}
            {scope === tab.id ? <span className={shellTabIndicatorClass} /> : null}
          </button>
        ))}
      </div>

      {scope === SURVEY_SCOPE.ASSIGNED ? (
        <>
          {assignedError ? <p className="text-sm text-red-500">{assignedError}</p> : null}
          {assignedLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`shell-skeleton h-48 animate-pulse ${shellCardClass}`} />
              ))}
            </div>
          ) : assignedSurveys.length === 0 ? (
            <div className={`p-12 text-center ${shellCardClass}`}>
              <p className={`text-lg ${shellPageTitleClass}`}>{t('page.assignedEmpty')}</p>
              <p className={`mt-2 ${shellPageSubtitleClass}`}>{t('page.assignedHint')}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {assignedSurveys.map((survey) => (
                  <AssignedSurveyCard key={getTestId(survey)} survey={survey} />
                ))}
              </div>
              {assignedPages > 1 ? (
                <SubjectsPagination
                  page={assignedPage}
                  totalPages={assignedPages}
                  onPageChange={setAssignedPage}
                />
              ) : null}
            </>
          )}
        </>
      ) : (
        <>
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('page.searchPlaceholder')}
                className={shellSearchInputClass}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {actionLoading ? <p className={shellSubtleTextClass}>{t('page.processing')}</p> : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`shell-skeleton h-48 animate-pulse ${shellCardClass}`} />
              ))}
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className={`p-12 text-center ${shellCardClass}`}>
              <p className={`text-lg ${shellPageTitleClass}`}>{t('page.empty')}</p>
              <p className={`mt-2 ${shellPageSubtitleClass}`}>
                {search.trim() ? t('page.emptySearch') : t('page.emptyHint')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSurveys.map((survey) => (
                  <SurveyCard
                    key={getTestId(survey)}
                    survey={survey}
                    onArchive={(item) => setPendingAction({ type: SURVEY_ACTION.ARCHIVE, test: item })}
                    onClose={(item) => setPendingAction({ type: SURVEY_ACTION.CLOSE, test: item })}
                    onDelete={(item) => setPendingAction({ type: SURVEY_ACTION.DELETE, test: item })}
                  />
                ))}
              </div>
              {pages > 1 ? (
                <SubjectsPagination page={page} totalPages={pages} onPageChange={setPage} />
              ) : null}
            </>
          )}
        </>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title={dialogTitle}
        message={dialogMessage}
        note={dialogNote}
        itemLabel={t('confirm.itemLabel')}
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

export default SurveysPage
