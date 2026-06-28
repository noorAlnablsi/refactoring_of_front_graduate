import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPaginationItems } from '../../lib/pagination'

function PageButton({ children, active, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
        active
          ? 'bg-[#2AA8A2] text-white'
          : 'bg-white text-[#64748B] ring-1 ring-[#E5E9EB] hover:bg-[#F8FAFB] disabled:cursor-not-allowed disabled:opacity-50'
      }`}
    >
      {children}
    </button>
  )
}

function QuestionBanksPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const items = getPaginationItems(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-2">
      <PageButton
        ariaLabel="الصفحة السابقة"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>

      {items.map((item, index) =>
        item.type === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm font-bold text-[#94A3B8]">
            ...
          </span>
        ) : (
          <PageButton
            key={item.value}
            active={item.value === page}
            ariaLabel={`الصفحة ${item.value}`}
            onClick={() => onPageChange(item.value)}
          >
            {item.value}
          </PageButton>
        ),
      )}

      <PageButton
        ariaLabel="الصفحة التالية"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
    </div>
  )
}

export default QuestionBanksPagination
