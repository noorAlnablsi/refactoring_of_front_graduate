import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { formatGroupCreatedAt, formatGroupStudentCount } from '../../lib/studentGroupsModel'
import {
  shellBodyTextClass,
  shellCardClass,
  shellSectionTitleClass,
  shellSubtleTextClass,
} from '../../lib/shellUi'

function MembersGroupsPreview({ groups, loading }) {
  const { t } = useTranslation('groups')

  return (
    <section className={shellCardClass}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-4">
        <h2 className={shellSectionTitleClass}>{t('preview.title')}</h2>
        <Link to={ROUTES.GROUPS} className="text-sm font-bold text-[var(--shell-accent)] transition hover:opacity-80">
          {t('preview.viewAll')}
        </Link>
      </div>

      {loading ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('preview.loading')}</p>
      ) : groups.length === 0 ? (
        <p className={`px-5 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('preview.empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-[var(--shell-border)] text-xs text-[var(--shell-text-muted)]">
              <tr>
                <th className="px-5 py-3 font-semibold">{t('table.name')}</th>
                <th className="px-5 py-3 font-semibold">{t('table.subject')}</th>
                <th className="px-5 py-3 font-semibold">{t('table.teacher')}</th>
                <th className="px-5 py-3 font-semibold">{t('table.students')}</th>
                <th className="px-5 py-3 font-semibold">{t('table.createdAt')}</th>
                <th className="px-5 py-3 font-semibold">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-[var(--shell-border)] last:border-0">
                  <td className="px-5 py-4 font-bold text-[var(--shell-text)]">{group.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-[var(--shell-accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--shell-accent)]">
                      {group.subject?.name || '—'}
                    </span>
                  </td>
                  <td className={`px-5 py-4 ${shellBodyTextClass}`}>{group.ownerName}</td>
                  <td className={`px-5 py-4 ${shellBodyTextClass}`}>
                    {formatGroupStudentCount(group.studentCount)}
                  </td>
                  <td className={`px-5 py-4 ${shellSubtleTextClass}`}>
                    {formatGroupCreatedAt(group.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={ROUTES.GROUP_DETAILS.replace(':groupId', String(group.id))}
                      className="text-sm font-bold text-[var(--shell-accent)]"
                    >
                      {t('preview.viewDetails')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default MembersGroupsPreview
