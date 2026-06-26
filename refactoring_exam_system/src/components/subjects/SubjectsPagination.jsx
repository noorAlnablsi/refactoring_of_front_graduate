import { ChevronLeft, ChevronRight } from 'lucide-react'

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

function SubjectsPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <PageButton
        ariaLabel="الصفحة السابقة"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <PageButton
          key={pageNumber}
          active={pageNumber === page}
          ariaLabel={`الصفحة ${pageNumber}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </PageButton>
      ))}

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

export default SubjectsPagination
