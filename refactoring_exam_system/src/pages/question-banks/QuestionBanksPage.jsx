import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import SoftDeleteConfirmDialog from '../../components/common/SoftDeleteConfirmDialog'
import AlertNoticeDialog from '../../components/common/AlertNoticeDialog'
import CreateQuestionBankModal from '../../components/question-banks/CreateQuestionBankModal'
import EditQuestionBankModal from '../../components/question-banks/EditQuestionBankModal'
import QuestionBankCard from '../../components/question-banks/QuestionBankCard'
import CommunityQuestionBankCard from '../../components/question-banks/CommunityQuestionBankCard'
import QuestionBankCreateCard from '../../components/question-banks/QuestionBankCreateCard'
import QuestionBanksEmptyState from '../../components/question-banks/QuestionBanksEmptyState'
import QuestionBanksPagination from '../../components/question-banks/QuestionBanksPagination'
import QuestionBanksSkeleton from '../../components/question-banks/QuestionBanksSkeleton'
import { ROUTES } from '../../constants/routes'
import { useCommunityBanksView } from '../../hooks/question-banks/useCommunityBanksView'
import { useQuestionBanks } from '../../hooks/question-banks/useQuestionBanks'
import { getQuestionBanksListPath, parseQuestionBanksTab, QUESTION_BANK_TABS } from '../../lib/questionBanks'
import {
  canAccessQuestionBanks,
  canEditQuestionBank,
  isInstitutionWorkspace,
  isQuestionBankOwner,
} from '../../lib/workspaceContext'
import { archiveQuestionBank } from '../../services/questionBanks.service'
import { useToastStore } from '../../store/toastStore'

const TABS = [
  { id: QUESTION_BANK_TABS.MY, label: 'بنوكي' },
  { id: QUESTION_BANK_TABS.WORKSPACE, label: 'بنوك ضمن المؤسسة', institutionOnly: true },
  { id: QUESTION_BANK_TABS.COMMUNITY, label: 'مجتمع' },
]

function QuestionBanksPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const showToast = useToastStore((s) => s.showToast)
  const showInstitutionTab = isInstitutionWorkspace()
  const visibleTabs = useMemo(
    () => TABS.filter((tab) => !tab.institutionOnly || showInstitutionTab),
    [showInstitutionTab],
  )
  const visibleTabIds = useMemo(() => visibleTabs.map((tab) => tab.id), [visibleTabs])
  const activeTab = parseQuestionBanksTab(searchParams.get('tab'), visibleTabIds)
  const { banks, filteredBanks, loading, error, search, setSearch, refetch } = useQuestionBanks(activeTab)
  const isCommunityTab = activeTab === QUESTION_BANK_TABS.COMMUNITY
  const {
    page: communityPage,
    setPage: setCommunityPage,
    paginatedBanks: paginatedCommunityBanks,
    totalPages: communityTotalPages,
  } = useCommunityBanksView(isCommunityTab ? filteredBanks : [])
  const [createOpen, setCreateOpen] = useState(false)
  const [editBank, setEditBank] = useState(null)
  const [archiveBank, setArchiveBank] = useState(null)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [blockedNotice, setBlockedNotice] = useState('')

  const handleTabChange = (tabId) => {
    setSearch('')
    const nextParams = new URLSearchParams(searchParams)
    if (tabId === QUESTION_BANK_TABS.MY) {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', tabId)
    }
    setSearchParams(nextParams)
  }

  const hasSearch = search.trim().length > 0

  if (!canAccessQuestionBanks()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleArchive = async () => {
    if (!archiveBank) return
    setArchiveLoading(true)
    try {
      await archiveQuestionBank(archiveBank.id)
      showToast('تم حذف بنك الأسئلة')
      setArchiveBank(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setArchiveLoading(false)
    }
  }

  const isOwnedStyleTab =
    activeTab === QUESTION_BANK_TABS.MY || activeTab === QUESTION_BANK_TABS.WORKSPACE

  const openEditor = (bank) =>
    navigate(`${ROUTES.QUESTION_BANKS}/${bank.id}/editor`, {
      state: { bank, sourceTab: activeTab },
    })

  const handleCommunityEdit = (bank) => {
    if (isQuestionBankOwner(bank)) {
      setEditBank(bank)
      return
    }
    setBlockedNotice('لا يمكنك التعديل على هذا البنك')
  }

  const handleCommunityDelete = (bank) => {
    if (isQuestionBankOwner(bank)) {
      setArchiveBank(bank)
      return
    }
    setBlockedNotice('لا يمكنك حذف هذا البنك')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#2AA8A2]">المشروع الأكاديمي</p>
          <h1 className="mt-1 text-4xl font-extrabold text-[#2A3433]">بنوك الأسئلة</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            قم ببناء مستودع أكاديمي شامل من خلال تحديد المعلومات الأساسية وإضافة أسئلة متنوعة لتقييم طلابك.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.22)]"
        >
          <Plus className="h-4 w-4" />
          إضافة بنك جديد
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-[#E5E9EB]">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`relative pb-3 text-sm font-bold ${
              activeTab === tab.id ? 'text-[#2AA8A2]' : 'text-[#64748B]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && !loading ? (
              <span className="mr-2 rounded-full bg-[#E8F7F6] px-2 py-0.5 text-xs text-[#2AA8A2]">
                {banks.length}
              </span>
            ) : null}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#E5E9EB]">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="البحث في البنوك..."
            className="h-11 w-full rounded-xl bg-[#F6F8F9] pr-10 pl-4 text-sm text-[#374151] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#2AA8A2]/30"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? <QuestionBanksSkeleton ownedStyle={isOwnedStyleTab} /> : null}

      {!loading && isOwnedStyleTab ? (
        <div className="flex flex-wrap gap-4">
          {activeTab === QUESTION_BANK_TABS.MY ? (
            <QuestionBankCreateCard onClick={() => setCreateOpen(true)} />
          ) : null}
          {filteredBanks.map((bank) => (
            <QuestionBankCard
              key={bank.id}
              bank={bank}
              canManage={canEditQuestionBank(bank, activeTab)}
              onEdit={setEditBank}
              onDelete={setArchiveBank}
              onOpenEditor={openEditor}
            />
          ))}
        </div>
      ) : null}

      {!loading && activeTab === QUESTION_BANK_TABS.COMMUNITY ? (
        <div className="space-y-6">
          <QuestionBanksPagination
            page={communityPage}
            totalPages={communityTotalPages}
            onPageChange={setCommunityPage}
          />

          <div className="flex flex-wrap gap-4">
            <QuestionBankCreateCard onClick={() => setCreateOpen(true)} />
            {paginatedCommunityBanks.map((bank) => (
              <CommunityQuestionBankCard
                key={bank.id}
                bank={bank}
                onEdit={handleCommunityEdit}
                onDelete={handleCommunityDelete}
                onOpenEditor={openEditor}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!loading &&
      filteredBanks.length === 0 &&
      !(activeTab === QUESTION_BANK_TABS.MY && !hasSearch) &&
      !(activeTab === QUESTION_BANK_TABS.COMMUNITY && !hasSearch) ? (
        <QuestionBanksEmptyState
          searching={hasSearch}
          tab={activeTab}
          onCreate={() => setCreateOpen(true)}
        />
      ) : null}

      <CreateQuestionBankModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(bank) =>
          navigate(`${ROUTES.QUESTION_BANKS}/${bank.id}/editor`, {
            state: { bank, sourceTab: QUESTION_BANK_TABS.MY },
          })
        }
      />

      <EditQuestionBankModal
        key={editBank?.id || 'empty'}
        open={Boolean(editBank)}
        bank={editBank}
        onClose={() => setEditBank(null)}
        onUpdated={() => {
          setEditBank(null)
          refetch()
        }}
      />

      <SoftDeleteConfirmDialog
        open={Boolean(archiveBank)}
        itemLabel="البنك"
        itemName={archiveBank?.title}
        loading={archiveLoading}
        onClose={() => setArchiveBank(null)}
        onConfirm={handleArchive}
      />

      <AlertNoticeDialog
        open={Boolean(blockedNotice)}
        message={blockedNotice}
        onClose={() => setBlockedNotice('')}
      />
    </div>
  )
}

export default QuestionBanksPage
