import { BookOpen, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import VisibilityBadge from './VisibilityBadge'
import { formatDate } from '../../lib/questionBanks'

function QuestionBankCard({ bank, canManage = true, onEdit, onArchive, onOpenEditor }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between gap-4">
        <VisibilityBadge value={bank.visibility} />
        <span className="rounded-xl bg-[#E8F7F6] p-2 text-[#2AA8A2]">
          <BookOpen className="h-4 w-4" />
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-extrabold text-[#2A3433]">{bank.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#2AA8A2]">{bank.subject_name || '—'}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#64748B]">
        {bank.description || 'لا يوجد وصف'}
      </p>

      <div className="mt-5 flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(bank.created_at)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEF2F3] pt-4">
        <button
          type="button"
          onClick={() => onOpenEditor(bank.id)}
          className="rounded-lg bg-[#2AA8A2] px-3 py-2 text-xs font-bold text-white"
        >
          فتح المحرر
        </button>
        {canManage ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(bank)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F6F8F9]"
            >
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </button>
            <button
              type="button"
              onClick={() => onArchive(bank)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              أرشفة
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default QuestionBankCard
