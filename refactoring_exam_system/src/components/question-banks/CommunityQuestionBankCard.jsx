import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  communityQuestionBankCardClassName,
  getBankAuthorAvatar,
  getBankAuthorName,
  getCommunityBankTheme,
} from '../../lib/questionBanks'
import { isQuestionBankOwner } from '../../lib/workspaceContext'
import BankCardStatsBar from './BankCardStatsBar'

const cardShadow =
  'shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]'
const cardShadowHover =
  'hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.04)]'

function AuthorAvatar({ name, avatarUrl, accent, unknownInitial }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#E5E9EB]"
      />
    )
  }

  const initial = name?.trim()?.charAt(0) || unknownInitial

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
  const { t } = useTranslation(['questionBanks', 'common'])
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const canManage = isQuestionBankOwner(bank)
  const theme = getCommunityBankTheme(bank)
  const authorName = getBankAuthorName(bank)
  const authorAvatar = getBankAuthorAvatar(bank)
  const showAuthor = Boolean(authorName)

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
      <div className="h-3 shrink-0" style={{ backgroundColor: theme.accent }} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className="max-w-[70%] truncate rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
          >
            {bank.subject_name || t('card.generalSubject')}
          </span>

          {canManage ? (
            <div className="relative shrink-0" ref={menuRef} onClick={stopCardAction}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F6F8F9] hover:text-[#374151]"
                aria-label={t('card.menuAria')}
                aria-expanded={menuOpen}
              >
                <MoreVertical className="h-5 w-5" strokeWidth={2} />
              </button>

              {menuOpen ? (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[132px] overflow-hidden rounded-xl bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-1 ring-[#E5E9EB]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit?.(bank)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F8FAFB]"
                  >
                    <Pencil className="h-4 w-4 text-[#64748B]" />
                    {t('actions.edit', { ns: 'common' })}
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
                    {t('actions.delete', { ns: 'common' })}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <span className="h-9 w-9 shrink-0" aria-hidden="true" />
          )}
        </div>

        <div className="mt-4 flex flex-1 flex-col text-right">
          <h3 className="line-clamp-2 text-base font-bold leading-7 text-[#111827]">{bank.title}</h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#6B7280]">
            {bank.description || t('card.communityDefaultDescription')}
          </p>
        </div>

        {showAuthor ? (
          <div className="mt-4 flex min-w-0 items-center gap-2">
            <AuthorAvatar
              name={authorName}
              avatarUrl={authorAvatar}
              accent={theme.accent}
              unknownInitial={t('card.unknownInitial')}
            />
            <span className="truncate text-xs font-medium text-[#374151]">{authorName}</span>
          </div>
        ) : null}

        <BankCardStatsBar
          bank={bank}
          accentColor={theme.accent}
          questionsVariant="community"
        />
      </div>
    </article>
  )
}

export default CommunityQuestionBankCard
