import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import ArchiveQuestionBankDialog from '../../components/question-banks/ArchiveQuestionBankDialog'
import CommunityBanksPlaceholder from '../../components/question-banks/CommunityBanksPlaceholder'
import CreateQuestionBankModal from '../../components/question-banks/CreateQuestionBankModal'
import EditQuestionBankModal from '../../components/question-banks/EditQuestionBankModal'
import QuestionBankCard from '../../components/question-banks/QuestionBankCard'
import QuestionBanksEmptyState from '../../components/question-banks/QuestionBanksEmptyState'
import QuestionBanksSkeleton from '../../components/question-banks/QuestionBanksSkeleton'
import { ROUTES } from '../../constants/routes'
import { useQuestionBanks } from '../../hooks/question-banks/useQuestionBanks'
import { canAccessQuestionBanks } from '../../lib/workspaceContext'
import { archiveQuestionBank } from '../../services/questionBanks.service'
import { useToastStore } from '../../store/toastStore'

function QuestionBanksPage() {
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.showToast)
  const { filteredBanks, loading, error, search, setSearch, refetch } = useQuestionBanks()
  const [activeTab, setActiveTab] = useState('my')
  const [createOpen, setCreateOpen] = useState(false)
  const [editBank, setEditBank] = useState(null)
  const [archiveBank, setArchiveBank] = useState(null)
  const [archiveLoading, setArchiveLoading] = useState(false)

  const hasSearch = search.trim().length > 0
  const showMyBanks = activeTab === 'my'
  const countMy = useMemo(() => filteredBanks.length, [filteredBanks.length])

  if (!canAccessQuestionBanks()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleArchive = async () => {
    if (!archiveBank) return
    setArchiveLoading(true)
    try {
      await archiveQuestionBank(archiveBank.id)
      showToast('تمت أرشفة بنك الأسئلة')
      setArchiveBank(null)
      refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setArchiveLoading(false)
    }
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

      <div className="flex items-center gap-3 border-b border-[#E5E9EB]">
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`relative pb-3 text-sm font-bold ${activeTab === 'my' ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`}
        >
          بنوكي
          <span className="mr-2 rounded-full bg-[#E8F7F6] px-2 py-0.5 text-xs text-[#2AA8A2]">{countMy}</span>
          {activeTab === 'my' ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('community')}
          className={`relative pb-3 text-sm font-bold ${activeTab === 'community' ? 'text-[#2AA8A2]' : 'text-[#64748B]'}`}
        >
          المجتمع
          {activeTab === 'community' ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
          ) : null}
        </button>
      </div>

      {showMyBanks ? (
        <>
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

          {loading ? <QuestionBanksSkeleton /> : null}
          {!loading && filteredBanks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredBanks.map((bank) => (
                <QuestionBankCard
                  key={bank.id}
                  bank={bank}
                  onEdit={setEditBank}
                  onArchive={setArchiveBank}
                  onOpenEditor={(id) => navigate(`${ROUTES.QUESTION_BANKS}/${id}/editor`)}
                />
              ))}
            </div>
          ) : null}
          {!loading && filteredBanks.length === 0 ? (
            <QuestionBanksEmptyState searching={hasSearch} onCreate={() => setCreateOpen(true)} />
          ) : null}
        </>
      ) : (
        <CommunityBanksPlaceholder />
      )}

      <CreateQuestionBankModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(bank) => navigate(`${ROUTES.QUESTION_BANKS}/${bank.id}/editor`, { state: { bank } })}
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

      <ArchiveQuestionBankDialog
        open={Boolean(archiveBank)}
        bankTitle={archiveBank?.title}
        loading={archiveLoading}
        onClose={() => setArchiveBank(null)}
        onConfirm={handleArchive}
      />
    </div>
  )
}

export default QuestionBanksPage
