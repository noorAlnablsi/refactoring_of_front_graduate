import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, X } from 'lucide-react'
import { QUESTION_BANK_TABS } from '../../lib/questionBanks'
import { showAppToast } from '../../lib/appToast'
import {
  getWorkspaceQuestionBanks,
  getCommunityQuestionBanks,
  getMyQuestionBanks,
} from '../../services/questionBanks.service'
import { useToastStore } from '../../store/toastStore'
import { isInstitutionWorkspace } from '../../lib/workspaceContext'
import QuestionBanksPagination from '../question-banks/QuestionBanksPagination'
import SelectableQuestionBankCard from './SelectableQuestionBankCard'

const PICKER_TABS = {
  MY: QUESTION_BANK_TABS.MY,
  COMMUNITY: QUESTION_BANK_TABS.COMMUNITY,
}

const BANKS_PER_PAGE = 3
const EMPTY_SELECTED_IDS = []

function AddRandomBanksModal({
  open,
  subjectId,
  initialSelectedIds = EMPTY_SELECTED_IDS,
  selectionMode = 'multiple',
  onClose,
  onBanksSelected,
}) {
  const { t } = useTranslation(['exams', 'questionBanks'])
  const showToast = useToastStore((s) => s.showToast)
  const showWorkspaceTab = isInstitutionWorkspace()
  const [activeTab, setActiveTab] = useState(PICKER_TABS.MY)
  const [myBanks, setMyBanks] = useState([])
  const [workspaceBanks, setWorkspaceBanks] = useState([])
  const [communityBanks, setCommunityBanks] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedBankIds, setSelectedBankIds] = useState([])

  const initialSelectedIdsKey = initialSelectedIds.join(',')

  useEffect(() => {
    if (!open) return
    setSelectedBankIds([...initialSelectedIds])
  }, [open, initialSelectedIdsKey, initialSelectedIds])

  useEffect(() => {
    if (!open) return undefined

    setActiveTab(PICKER_TABS.MY)
    setPage(1)

    let cancelled = false
    setLoading(true)

    const resolveBankSubjectId = (bank) =>
      bank?.subject_id ?? bank?.subject?.id ?? bank?.subject?.subject_id ?? bank?.subjectId ?? null

    const matchesSubject = (bank) => {
      if (subjectId == null || subjectId === '') return true

      const bankSubjectId = resolveBankSubjectId(bank)
      if (bankSubjectId == null || bankSubjectId === '') return true

      return String(bankSubjectId) === String(subjectId)
    }

    Promise.allSettled([
      getMyQuestionBanks().then((data) =>
        (data.question_banks || [])
          .filter((bank) => !bank.is_archived)
          .filter((bank) => bank.visibility === 'PRIVATE'),
      ),
      showWorkspaceTab
        ? Promise.all([getMyQuestionBanks(), getWorkspaceQuestionBanks({ perPage: 100 })]).then(
            ([myData, workspaceData]) => {
              const myWorkspaceBanks = (myData.question_banks || []).filter(
                (bank) => !bank.is_archived && bank.visibility === 'WORKSPACE',
              )
              const sharedWorkspaceBanks = (workspaceData.question_banks || []).filter(
                (bank) => !bank.is_archived,
              )
              const byId = new Map()
              ;[...myWorkspaceBanks, ...sharedWorkspaceBanks].forEach((bank) => {
                if (bank?.id != null) byId.set(bank.id, bank)
              })
              return [...byId.values()]
            },
          )
        : Promise.resolve([]),
      getCommunityQuestionBanks({ perPage: 100 }).then(
        (data) => (data.question_banks || []).filter((bank) => !bank.is_archived),
      ),
    ])
      .then(([mineResult, workspaceResult, communityResult]) => {
        if (cancelled) return

        const mine = mineResult.status === 'fulfilled' ? mineResult.value : []
        const workspace = workspaceResult.status === 'fulfilled' ? workspaceResult.value : []
        const community = communityResult.status === 'fulfilled' ? communityResult.value : []

        setMyBanks(mine.filter(matchesSubject))
        setWorkspaceBanks(workspace.filter(matchesSubject))
        setCommunityBanks(community.filter(matchesSubject))

        if (mineResult.status === 'rejected') {
          showToast(mineResult.reason?.message || t('banksModal.errors.loadMy'), 'error')
        }
        if (workspaceResult.status === 'rejected') {
          showToast(workspaceResult.reason?.message || t('banksModal.errors.loadWorkspace'), 'error')
        }
        if (communityResult.status === 'rejected') {
          showToast(communityResult.reason?.message || t('banksModal.errors.loadCommunity'), 'error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, showToast, subjectId, showWorkspaceTab, t])

  const banksForTab =
    activeTab === PICKER_TABS.MY
      ? myBanks
      : activeTab === QUESTION_BANK_TABS.WORKSPACE
        ? workspaceBanks
        : communityBanks
  const totalPages = Math.max(1, Math.ceil(banksForTab.length / BANKS_PER_PAGE))

  useEffect(() => {
    setPage(1)
  }, [activeTab, banksForTab.length])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedBanks = useMemo(() => {
    const start = (page - 1) * BANKS_PER_PAGE
    return banksForTab.slice(start, start + BANKS_PER_PAGE)
  }, [banksForTab, page])

  const allBanks = useMemo(
    () => [...myBanks, ...workspaceBanks, ...communityBanks],
    [communityBanks, myBanks, workspaceBanks],
  )

  const toggleBank = (id) => {
    if (selectionMode === 'single') {
      setSelectedBankIds((prev) => (prev.includes(id) ? [] : [id]))
      return
    }

    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handlePickDone = () => {
    if (!selectedBankIds.length) {
      showAppToast(
        selectionMode === 'single' ? 'banksModal.selectOne' : 'banksModal.selectAtLeastOne',
        'error',
        { ns: 'exams' },
      )
      return
    }

    const selectedBanks = allBanks.filter((bank) => selectedBankIds.includes(bank.id))
    onBanksSelected?.(selectedBanks)
    onClose?.()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        dir="rtl"
        className="flex h-[785px] w-full max-w-[896px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-[44px] font-extrabold leading-[1.2] text-[#2A3433]">{t('banksModal.title')}</h2>
        </div>

        <div className="border-b border-[#E5E9EB] px-6 pt-5">
          <div className="flex items-center justify-start gap-8">
            <button
              type="button"
              onClick={() => setActiveTab(PICKER_TABS.MY)}
              className={`relative pb-3 text-base font-bold transition ${
                activeTab === PICKER_TABS.MY ? 'text-[#2AA8A2]' : 'text-[#64748B]'
              }`}
            >
              {t('banksModal.myBanks')}
              {!loading ? (
                <span className="mr-2 rounded-full bg-[#E8F7F6] px-2 py-0.5 text-xs text-[#2AA8A2]">
                  {myBanks.length}
                </span>
              ) : null}
              {activeTab === PICKER_TABS.MY ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
              ) : null}
            </button>

            {showWorkspaceTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(QUESTION_BANK_TABS.WORKSPACE)}
                className={`relative pb-3 text-base font-bold transition ${
                  activeTab === QUESTION_BANK_TABS.WORKSPACE ? 'text-[#2AA8A2]' : 'text-[#64748B]'
                }`}
              >
                {t('banksModal.workspace')}
                {!loading ? (
                  <span className="mr-2 rounded-full bg-[#E8F7F6] px-2 py-0.5 text-xs text-[#2AA8A2]">
                    {workspaceBanks.length}
                  </span>
                ) : null}
                {activeTab === QUESTION_BANK_TABS.WORKSPACE ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
                ) : null}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveTab(PICKER_TABS.COMMUNITY)}
              className={`relative inline-flex items-center gap-2 pb-3 text-base font-bold transition ${
                activeTab === PICKER_TABS.COMMUNITY ? 'text-[#2AA8A2]' : 'text-[#64748B]'
              }`}
            >
              <Globe className="h-4 w-4" />
              {t('banksModal.community')}
              {!loading ? (
                <span className="rounded-full bg-[#E8F7F6] px-2 py-0.5 text-xs text-[#2AA8A2]">
                  {communityBanks.length}
                </span>
              ) : null}
              {activeTab === PICKER_TABS.COMMUNITY ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2AA8A2]" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
          {loading ? (
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-[324px] w-[255.67px] animate-pulse rounded-xl bg-[#F1F5F9]" />
              ))}
            </div>
          ) : paginatedBanks.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#94A3B8]">{t('banksModal.empty')}</p>
          ) : (
            <div className="flex justify-center gap-4">
              {paginatedBanks.map((bank) => (
                <SelectableQuestionBankCard
                  key={bank.id}
                  bank={bank}
                  selected={selectedBankIds.includes(bank.id)}
                  variant={activeTab === PICKER_TABS.COMMUNITY ? 'community' : 'owned'}
                  onToggle={toggleBank}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-[#E5E9EB] px-6 py-5">
          <QuestionBanksPagination page={page} totalPages={totalPages} onPageChange={setPage} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePickDone}
              disabled={!selectedBankIds.length}
              className="min-w-[126px] rounded-xl bg-[#2AA8A2] px-8 py-3 text-base font-bold text-white shadow-[0_8px_16px_rgba(42,168,162,0.2)] disabled:opacity-50"
            >
              {t('banksModal.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddRandomBanksModal
