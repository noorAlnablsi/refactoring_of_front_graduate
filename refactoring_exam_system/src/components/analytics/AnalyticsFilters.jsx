import { useTranslation } from 'react-i18next'
import { getTeacherMembershipId } from '../../lib/workspaceTeachers'
import { shellInputClass } from '../../lib/shellUi'

const selectClass = `h-11 min-w-[140px] ${shellInputClass} px-3 text-sm font-semibold`

function AnalyticsFilters({
  subjects = [],
  teachers = [],
  subjectId,
  teacherMembershipId,
  datePreset,
  dateFrom,
  dateTo,
  onSubjectChange,
  onTeacherChange,
  onDatePresetChange,
  onDateFromChange,
  onDateToChange,
  disabled = false,
}) {
  const { t } = useTranslation('analytics')

  return (
    <div className="flex flex-wrap items-end justify-end gap-3">
      <label className="flex min-w-[148px] flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.subject')}</span>
        <select
          className={selectClass}
          value={subjectId}
          disabled={disabled}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          <option value="">{t('filters.allSubjects')}</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[148px] flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.teacher')}</span>
        <select
          className={selectClass}
          value={teacherMembershipId}
          disabled={disabled}
          onChange={(e) => onTeacherChange(e.target.value)}
        >
          <option value="">{t('filters.allTeachers')}</option>
          {teachers.map((teacher) => {
            const membershipId = getTeacherMembershipId(teacher)
            if (!membershipId) return null
            return (
              <option key={membershipId} value={membershipId}>
                {teacher.full_name || teacher.name || `#${membershipId}`}
              </option>
            )
          })}
        </select>
      </label>

      <label className="flex min-w-[148px] flex-col gap-1.5">
        <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateRange')}</span>
        <select
          className={selectClass}
          value={datePreset}
          disabled={disabled}
          onChange={(e) => onDatePresetChange(e.target.value)}
        >
          <option value="7d">{t('filters.presets.7d')}</option>
          <option value="30d">{t('filters.presets.30d')}</option>
          <option value="90d">{t('filters.presets.90d')}</option>
          <option value="custom">{t('filters.presets.custom')}</option>
        </select>
      </label>

      {datePreset === 'custom' ? (
        <>
          <label className="flex min-w-[148px] flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateFrom')}</span>
            <input
              type="date"
              className={selectClass}
              value={dateFrom}
              disabled={disabled}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </label>
          <label className="flex min-w-[148px] flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--shell-text-muted)]">{t('filters.dateTo')}</span>
            <input
              type="date"
              className={selectClass}
              value={dateTo}
              disabled={disabled}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </label>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsFilters
