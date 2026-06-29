import { ChevronDown } from 'lucide-react'
import { SUBJECT_SORT_OPTIONS } from '../../constants/subjects'

function SubjectsSortSelect({ value, onChange }) {
  const selectedLabel =
    SUBJECT_SORT_OPTIONS.find((option) => option.value === value)?.label || 'الأحدث'

  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#64748B]">
      <span className="font-medium">ترتيب حسب:</span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="cursor-pointer appearance-none rounded-lg bg-[#F6F8F9] py-2 pl-8 pr-3 text-sm font-semibold text-[#374151] outline-none focus:ring-2 focus:ring-[#2AA8A2]/30"
          aria-label="ترتيب عرض المواد"
        >
          {SUBJECT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-2.5 h-4 w-4 text-[#94A3B8]" />
        <span className="sr-only">{selectedLabel}</span>
      </span>
    </label>
  )
}

export default SubjectsSortSelect
