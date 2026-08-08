import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import UserAvatar from '../../dashboard/UserAvatar'
import { getMemberStatusBadge } from '../../../lib/workspaceMembers'
import {
  getStudentMembershipId,
  normalizeWorkspaceStudent,
} from '../../../lib/workspaceStudents'
import { getWorkspaceStudents } from '../../../services/workspaces.service'
import {
  shellBodyTextClass,
  shellCardClass,
  shellDividerClass,
  shellPageTitleClass,
} from '../../../lib/shellUi'

function resolveStudentStatus(workspaceStudent, subjectStudent) {
  return (
    workspaceStudent?.user_status ||
    subjectStudent?.user_status ||
    subjectStudent?.status ||
    null
  )
}

function SubjectStudentsTab({ students }) {
  const { t } = useTranslation('subjects')
  const [workspaceByMembershipId, setWorkspaceByMembershipId] = useState({})
  const [enriching, setEnriching] = useState(true)

  useEffect(() => {
    let cancelled = false
    setEnriching(true)

    // Active workspace members only — deleted/removed students are not returned here.
    getWorkspaceStudents({ page: 1, per_page: 100 })
      .then((data) => {
        if (cancelled) return
        const map = {}
        for (const student of data.students || []) {
          const membershipId = getStudentMembershipId(student)
          if (membershipId != null) map[membershipId] = student
        }
        setWorkspaceByMembershipId(map)
      })
      .catch(() => {
        if (!cancelled) setWorkspaceByMembershipId({})
      })
      .finally(() => {
        if (!cancelled) setEnriching(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    return (students || [])
      .map((student) => {
        const membershipId = getStudentMembershipId(student)
        const workspace =
          membershipId != null ? workspaceByMembershipId[membershipId] : null

        // Subject API may still return stale enrollments after account/workspace removal.
        // Status must come from a real field — never invent ACTIVE.
        const userStatus = resolveStudentStatus(workspace, student)
        if (!workspace && !userStatus) return null

        const enriched = normalizeWorkspaceStudent({
          ...student,
          ...(workspace || {}),
          membership_id: membershipId ?? student.membership_id,
          full_name: student.full_name || workspace?.full_name,
        })

        return {
          ...enriched,
          email: workspace?.email ?? student.email ?? null,
          phone: enriched.phone ?? student.phone ?? student.phone_number ?? null,
          user_status: userStatus,
          avatar_url: workspace?.avatar_url ?? student.avatar_url ?? null,
        }
      })
      .filter(Boolean)
  }, [students, workspaceByMembershipId])

  if (!students?.length || (!enriching && rows.length === 0)) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#64748B]">{t('details.students.empty')}</p>
      </div>
    )
  }

  if (enriching) {
    return (
      <div className={`overflow-hidden ${shellCardClass}`}>
        <div className="space-y-0 p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shell-skeleton mx-3 my-2 h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${shellCardClass}`}>
      <div className="overflow-x-auto">
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
                        {student.full_name || '—'}
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
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4 ${status.className}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {status.label}
                    </span>
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
