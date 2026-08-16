import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Filter } from 'lucide-react'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getTeacherMembershipId } from '../../lib/workspaceTeachers'
import {
  shellAccentButtonClass,
  shellCardClass,
  shellInputClass,
} from '../../lib/shellUi'

const selectClass = `h-11 w-full appearance-none ${shellInputClass} px-3 pe-9 text-sm font-semibold`
const filterFieldClass = 'flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[148px] sm:flex-none sm:w-[168px]'

function AnalyticsFilters({
  subjects = [],
  teachers = [],
  subjectId,
  teacherMembershipId,
  datePreset,
  dateFrom,
  dateTo,
  onApply,
  disabled = false,
}) {
  const { t } = useTranslation('analytics')
  const [draftSubjectId, setDraftSubjectId] = useState(subjectId)
  const [draftTeacherId, setDraftTeacherId] = useState(teacherMembershipId)
  const [draftPreset, setDraftPreset] = useState(datePreset)
  const [draftFrom, setDraftFrom] = useState(dateFrom)
  const [draftTo, setDraftTo] = useState(dateTo)

  useEffect(() => {
    setDraftSubjectId(subjectId)
    setDraftTeacherId(teacherMembershipId)
    setDraftPreset(datePreset)
    setDraftFrom(dateFrom)
    setDraftTo(dateTo)
  }, [subjectId, teacherMembershipId, datePreset, dateFrom, dateTo])

  const handlePresetChange = (preset) => {
    setDraftPreset(preset)
  }

  const handleApply = () => {
    onApply?.({
      subjectId: draftSubjectId,
      teacherMembershipId: draftTeacherId,
      datePreset: draftPreset,
      dateFrom: draftFrom,
      dateTo: draftTo,
    })
  }

  return (
    <div className={`p-4 sm:p-5 ${shellCardClass}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className={filterFieldClass}>
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.subject')}</span>
          <select
            className={selectClass}
            value={draftSubjectId}
            disabled={disabled}
            onChange={(e) => setDraftSubjectId(e.target.value)}
          >
            <option value="">{t('filters.allSubjects')}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.teacher')}</span>
          <select
            className={selectClass}
            value={draftTeacherId}
            disabled={disabled}
            onChange={(e) => setDraftTeacherId(e.target.value)}
          >
            <option value="">{t('filters.allTeachers')}</option>
            {teachers.map((teacher) => {
              const membershipId = getTeacherMembershipId(teacher)
              if (!membershipId) return null
              return (
                <option key={membershipId} value={membershipId}>
                  {teacher.full_name || teacher.name || `#${formatLocaleNumber(membershipId)}`}
                </option>
              )
            })}
          </select>
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateRange')}</span>
          <select
            className={selectClass}
            value={draftPreset}
            disabled={disabled}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="7d">{t('filters.presets.7d')}</option>
            <option value="30d">{t('filters.presets.30d')}</option>
            <option value="90d">{t('filters.presets.90d')}</option>
            <option value="custom">{t('filters.presets.custom')}</option>
          </select>
        </label>

        {draftPreset === 'custom' ? (
          <>
            <label className={filterFieldClass}>
              <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateFrom')}</span>
              <input
                type="date"
                className={selectClass}
                value={draftFrom}
                disabled={disabled}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </label>
            <label className={filterFieldClass}>
              <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateTo')}</span>
              <input
                type="date"
                className={selectClass}
                value={draftTo}
                disabled={disabled}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </label>
          </>
        ) : null}

        <button
          type="button"
          disabled={disabled}
          onClick={handleApply}
          className={`${shellAccentButtonClass} h-11 shrink-0 justify-center px-5 disabled:opacity-60 lg:ms-auto`}
        >
          <Filter className="h-4 w-4" strokeWidth={2.2} />
          {t('filters.apply')}
        </button>
      </div>
    </div>
  )
}

export default AnalyticsFilters
