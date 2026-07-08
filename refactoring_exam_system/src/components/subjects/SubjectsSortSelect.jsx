import { ChevronDown } from 'lucide-react'
import { SUBJECT_SORT_OPTIONS } from '../../constants/subjects'
import { shellBodyTextClass, shellInputClass } from '../../lib/shellUi'

function SubjectsSortSelect({ value, onChange }) {
  const selectedLabel =
    SUBJECT_SORT_OPTIONS.find((option) => option.value === value)?.label || 'الأحدث'

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${shellBodyTextClass}`}>
      <span className="font-medium">ترتيب حسب:</span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`cursor-pointer appearance-none py-2 pl-8 pr-3 text-sm font-semibold ${shellInputClass}`}
          aria-label="ترتيب عرض المواد"
        >
          {SUBJECT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-2.5 h-4 w-4 text-[var(--shell-text-subtle)]" />
        <span className="sr-only">{selectedLabel}</span>
      </span>
    </label>
  )
}

export default SubjectsSortSelect
