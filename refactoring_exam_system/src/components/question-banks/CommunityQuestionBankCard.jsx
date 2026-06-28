import { useEffect, useRef, useState } from 'react'
import { Bookmark, FileText, MoreVertical, Pencil, RotateCcw, Star, Trash2 } from 'lucide-react'
import {
  communityQuestionBankCardClassName,
  formatCommunityQuestionsCount,
  formatCommunityUsageCount,
  getCommunityBankAuthorAvatar,
  getCommunityBankAuthorName,
  getCommunityBankRating,
  getCommunityBankTheme,
} from '../../lib/questionBanks'

const cardShadow =
  'shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]'
const cardShadowHover =
  'hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.04)]'

function StarRating({ value }) {
  const rounded = Math.round(value)

  return (
    <div className="flex items-center gap-0.5" aria-label={`التقييم ${rounded} من 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${
            index < rounded ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#E5E7EB]'
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function AuthorAvatar({ name, avatarUrl, accent }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#E5E9EB]"
      />
    )
  }

  const initial = name?.trim()?.charAt(0) || '؟'

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}

function CommunityQuestionBankCard({ bank, onEdit, onDelete, onOpenEditor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const theme = getCommunityBankTheme(bank)
  const authorName = getCommunityBankAuthorName(bank)
  const authorAvatar = getCommunityBankAuthorAvatar(bank)
  const rating = getCommunityBankRating(bank)

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
      className={`flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white transition active:scale-[0.995] ${communityQuestionBankCardClassName} ${cardShadow} ${cardShadowHover}`}
    >
      <div className="h-2 shrink-0" style={{ backgroundColor: theme.accent }} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
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

          <span
            className="max-w-[70%] truncate rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
          >
            {bank.subject_name || 'عام'}
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-base font-bold leading-7 text-[#111827]">{bank.title}</h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#6B7280]">
            {bank.description || 'بنك أسئلة مجتمعي يغطي محتوى المادة الدراسية.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <AuthorAvatar name={authorName} avatarUrl={authorAvatar} accent={theme.accent} />
            <span className="truncate text-xs font-medium text-[#374151]">{authorName}</span>
          </div>
          <StarRating value={rating} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#111827]">
            <span>{formatCommunityUsageCount(bank)}</span>
            <RotateCcw className="h-4 w-4 text-[#94A3B8]" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#111827]">
            <span>{formatCommunityQuestionsCount(bank)}</span>
            <FileText className="h-4 w-4" style={{ color: theme.accent }} strokeWidth={2} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default CommunityQuestionBankCard
