import { SUBJECT_SORT_OPTIONS } from '../../constants/subjects'

const selectClassName =
  'rounded-xl bg-[#F6F8F9] py-2.5 pl-4 pr-10 text-sm font-semibold text-[#374151] outline-none focus:ring-2 focus:ring-[#2AA8A2]/40'

function SubjectsSortSelect({ value, onChange }) {
  return (
    <select
      id="subjects-sort"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={selectClassName}
      aria-label="ترتيب عرض المواد"
    >
      {SUBJECT_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default SubjectsSortSelect
