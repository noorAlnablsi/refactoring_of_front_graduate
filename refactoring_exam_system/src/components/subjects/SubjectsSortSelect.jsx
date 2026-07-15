import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { getSubjectSortOptions } from '../../constants/subjects'
import { formatStatValue } from '../../lib/subjectDisplay'
import { shellBodyTextClass, shellInputClass } from '../../lib/shellUi'

function SubjectsSortSelect({ value, onChange }) {
  const { t } = useTranslation('subjects')
  const sortOptions = getSubjectSortOptions()
  const selectedLabel =
    sortOptions.find((option) => option.value === value)?.label || t('sort.newest')

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${shellBodyTextClass}`}>
      <span className="font-medium">{t('sort.label')}</span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`cursor-pointer appearance-none py-2 pl-8 pr-3 text-sm font-semibold ${shellInputClass}`}
          aria-label={t('sort.aria')}
        >
          {sortOptions.map((option) => (
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
