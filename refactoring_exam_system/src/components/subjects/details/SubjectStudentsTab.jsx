import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import UserAvatar from '../../dashboard/UserAvatar'
import { getMemberStatusBadge } from '../../../lib/workspaceMembers'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellPageTitleClass,
  shellTableHostClass,
  shellTableScrollClass,
} from '../../../lib/shellUi'

function SubjectStudentsTab({ students }) {
  const { t } = useTranslation('subjects')

  const rows = useMemo(() => {
    return (students || []).map((student) => {
      const membershipId = getStudentMembershipId(student)
      return {
        membership_id: membershipId ?? student.membership_id ?? null,
        assignment_id: student.assignment_id ?? null,
        user_id: student.user_id ?? null,
        full_name: student.full_name || '—',
        email: student.email || null,
        phone: student.phone_number ?? student.phone ?? null,
        user_status: student.user_status || student.status || null,
        avatar_url: student.avatar_url || null,
      }
    })
  }, [students])

  if (!rows.length) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">{t('details.students.empty')}</p>
      </div>
    )
  }

  return (
    <div className={`${shellTableHostClass} ${shellCardClass}`}>
      <div className={shellTableScrollClass}>
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead
            className={`border-b bg-[var(--shell-input-bg)] text-[13px] text-[var(--shell-text-muted)] ${shellDividerClass}`}
          >
            <tr>
              <th className="px-5 py-3.5 text-right font-semibold">
                {t('details.students.columns.student')}
              </th>
              <th className="px-5 py-3.5 text-right font-semibold">
                {t('details.students.columns.email')}
              </th>
              <th className="px-5 py-3.5 text-right font-semibold">
                {t('details.students.columns.phone')}
              </th>
              <th className="px-5 py-3.5 text-right font-semibold">
                {t('details.students.columns.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => {
              const status = getMemberStatusBadge(student.user_status)
              const user = {
                full_name: student.full_name,
                avatar_url: student.avatar_url,
              }

              return (
                <tr
                  key={student.membership_id ?? student.assignment_id ?? student.user_id}
                  className="border-b border-[var(--shell-border)] last:border-b-0"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" rounded />
                      <p className={`truncate font-bold ${shellPageTitleClass}`}>
                        {student.full_name}
                      </p>
                    </div>
                  </td>
                  <td className={`px-5 py-4 align-middle ${shellBodyTextClass}`}>
                    <span dir="ltr" className="inline-block text-right">
                      {student.email || '—'}
                    </span>
                  </td>
                  <td className={`px-5 py-4 align-middle ${shellBodyTextClass}`}>
                    <span dir="ltr" className="inline-block text-right">
                      {student.phone || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {student.user_status ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4 ${status.className}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {status.label}
                      </span>
                    ) : (
                      <span className={shellBodyTextClass}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SubjectStudentsTab
