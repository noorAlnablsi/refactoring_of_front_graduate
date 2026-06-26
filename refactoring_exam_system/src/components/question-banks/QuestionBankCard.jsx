import { useState } from 'react'
import { CalendarDays, FileQuestion, MoreVertical, Pencil, Sigma, Trash2 } from 'lucide-react'
import {
  formatBankCardDate,
  formatBankQuestionsCount,
} from '../../lib/questionBanks'

function QuestionBankCard({ bank, canManage = true, onEdit, onArchive, onOpenEditor }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleOpenEditor = () => {
    onOpenEditor(bank.id)
  }

  const handleEdit = (event) => {
    event.stopPropagation()
    setMenuOpen(false)
    onEdit(bank)
  }

  const handleArchive = (event) => {
    event.stopPropagation()
    setMenuOpen(false)
    onArchive(bank)
  }

  const toggleMenu = (event) => {
    event.stopPropagation()
    setMenuOpen((prev) => !prev)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => {
        setMenuOpen(false)
        handleOpenEditor()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpenEditor()
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    >
      <div className="h-[3px] bg-[#2AA8A2]" aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
            <Sigma className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="rounded-lg bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
            {bank.subject_name || 'عام'}
          </span>
        </div>

        {canManage ? (
          <div className="absolute left-4 top-6 z-10">
            <button
              type="button"
              onClick={toggleMenu}
              className="rounded-lg p-1.5 text-[#94A3B8] opacity-0 transition hover:bg-[#F6F8F9] hover:text-[#64748B] group-hover:opacity-100"
              aria-label="إجراءات البنك"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div
                className="absolute left-0 mt-1 min-w-[9rem] overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-[#E5E9EB]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFB]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  أرشفة
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <h3 className="mt-5 line-clamp-2 text-xl font-extrabold leading-8 text-[#2A3433]">{bank.title}</h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[#64748B]">
          {bank.description || 'لا يوجد وصف لهذا البنك بعد.'}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEF2F3] pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#374151]">
            <FileQuestion className="h-4 w-4 text-[#94A3B8]" />
            {formatBankQuestionsCount(bank)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatBankCardDate(bank.created_at)}
          </span>
        </div>
      </div>
    </article>
  )
}

export default QuestionBankCard
