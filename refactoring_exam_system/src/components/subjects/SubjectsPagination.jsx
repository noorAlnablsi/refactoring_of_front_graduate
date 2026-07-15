import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatStatValue } from '../../lib/subjectDisplay'
import { shellCardClass } from '../../lib/shellUi'

function PageButton({ children, active, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`flex h-9 min-w-9 items-center justify-center px-3 text-sm font-bold transition ${
        active
          ? 'rounded-full bg-[var(--shell-accent)] text-[var(--shell-accent-contrast)] shadow-[var(--shell-shadow-accent)]'
          : `rounded-lg text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] disabled:cursor-not-allowed disabled:opacity-50 ${shellCardClass}`
      }`}
    >
      {children}
    </button>
  )
}

function SubjectsPagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation('common')

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <PageButton
        ariaLabel={t('pagination.previousPage')}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <PageButton
          key={pageNumber}
          active={pageNumber === page}
          ariaLabel={t('pagination.page', { number: pageNumber })}
          onClick={() => onPageChange(pageNumber)}
        >
          {formatStatValue(pageNumber)}
        </PageButton>
      ))}

      <PageButton
        ariaLabel={t('pagination.nextPage')}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
    </div>
  )
}

export default SubjectsPagination
