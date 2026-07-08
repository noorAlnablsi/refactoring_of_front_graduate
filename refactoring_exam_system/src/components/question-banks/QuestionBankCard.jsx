import { useEffect, useRef, useState } from 'react'
import { CalendarDays, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  formatBankCardDate,
  formatBankQuestionsCount,
  ownedQuestionBankCardClassName,
} from '../../lib/questionBanks'
import { shellCardInteractiveClass } from '../../lib/shellUi'

function QuestionBankCard({ bank, canManage = false, onEdit, onDelete, onOpenEditor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const stopCardAction = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <article
      role="button"
      tabIndex={0}
      dir="rtl"
      onClick={() => onOpenEditor(bank)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenEditor(bank)
        }
      }}
      className={`flex cursor-pointer flex-col overflow-hidden transition active:scale-[0.995] ${ownedQuestionBankCardClassName} ${shellCardInteractiveClass}`}
    >
      <div
        className="h-3 shrink-0 bg-gradient-to-r from-[#A7E3DA] to-[#22C1A3]"
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          {canManage ? (
            <div className="relative shrink-0" ref={menuRef} onClick={stopCardAction}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F6F8F9] hover:text-[#374151]"
                aria-label="خيارات البنك"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="h-5 w-5" strokeWidth={2} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[132px] overflow-hidden rounded-xl bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-1 ring-[#E5E9EB]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit?.(bank)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F8FAFB]"
                  >
                    <Pencil className="h-4 w-4 text-[#64748B]" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete?.(bank)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <span className="h-10 w-10 shrink-0" aria-hidden="true" />
          )}

          <span className="rounded-full bg-[#E8F7F3] px-3 py-1 text-xs font-medium text-[#0EA896]">
            {bank.subject_name || 'عام'}
          </span>
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-center text-lg font-bold leading-8 text-[#111827]">
            {bank.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-center text-[13px] leading-6 text-[#6B7280]">
            {bank.description || 'لا يوجد وصف لهذا البنك بعد.'}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#111827]">
            <span>{formatBankQuestionsCount(bank)}</span>
            <FileText className="h-4 w-4 text-[#0EA896]" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{formatBankCardDate(bank.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default QuestionBankCard
