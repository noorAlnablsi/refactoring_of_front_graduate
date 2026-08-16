import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { formatLocaleNumber } from '../../lib/localeNumber'
import {
  getGroupConflictPayload,
  normalizeAvailableStudent,
} from '../../lib/studentGroupsModel'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { addGroupMembers, getAvailableGroupStudents } from '../../services/studentGroups.service'
import { useToastStore } from '../../store/toastStore'

function AddGroupMembersModal({ open, group, onClose, onSuccess }) {
  const { t } = useTranslation('groups')
  const showToast = useToastStore((s) => s.showToast)
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [conflicts, setConflicts] = useState([])

  useEffect(() => {
    if (!open || !group?.subjectId) return undefined
    setSelectedIds([])
    setSearch('')
    setConflicts([])
  }, [open, group?.subjectId])

  useEffect(() => {
    if (!open || !group?.subjectId) return undefined
    const delay = search.trim() ? 300 : 0
    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      getAvailableGroupStudents(group.subjectId, {
        search: search.trim() || undefined,
      })
        .then((data) => {
          if (!cancelled) setStudents((data.students || []).map(normalizeAvailableStudent))
        })
        .catch((err) => {
          if (cancelled) return
          showToast(translateBackendMessage(err.message) || t('errors.loadFailed'), 'error')
          setStudents([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, delay)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, group?.subjectId, search, showToast, t])

  const filtered = students

  const selectable = students.filter((s) => s.isAvailable)

  const toggle = (id, available) => {
    if (!available) return
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    if (!selectedIds.length) {
      onClose?.()
      return
    }
    setSubmitting(true)
    setConflicts([])
    try {
      await addGroupMembers(group.id, selectedIds)
      showToast(t('toasts.membersAdded'))
      onSuccess?.()
      onClose?.()
    } catch (err) {
      const conflict = getGroupConflictPayload(err)
      if (conflict) {
        setConflicts(conflict.conflicts)
        showToast(translateBackendMessage(conflict.message) || t('errors.conflict'), 'error')
      } else {
        showToast(translateBackendMessage(err.message) || t('errors.addMembersFailed'), 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !group) return null

  return (
    <div className={shellModalOverlayClass}>
      <div className={`max-w-2xl ${shellModalPanelClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className={`text-lg ${shellPageTitleClass}`}>{t('details.addStudents')}</h2>
            <p className={`mt-1 text-sm font-bold text-[var(--shell-accent)]`}>
              {t('create.selectedCount', {
                selected: formatLocaleNumber(selectedIds.length),
                total: formatLocaleNumber(selectable.length),
              })}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('create.searchPlaceholder')}
            className={`h-11 w-full pe-4 ps-10 text-sm ${shellInputClass}`}
          />
        </div>

        <div className="mt-4 max-h-[340px] overflow-y-auto rounded-xl ring-1 ring-[var(--shell-border)]">
          {loading ? (
            <p className={`px-4 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('table.loading')}</p>
          ) : filtered.length === 0 ? (
            <p className={`px-4 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('create.noStudents')}</p>
          ) : (
            <ul>
              {filtered.map((student) => (
                <li
                  key={student.membershipId}
                  className={`flex items-center gap-3 border-b border-[var(--shell-border)] px-4 py-3 last:border-0 ${
                    student.isAvailable ? '' : 'opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.membershipId)}
                    disabled={!student.isAvailable}
                    onChange={() => toggle(student.membershipId, student.isAvailable)}
                    className="h-4 w-4 accent-[var(--shell-accent)]"
                  />
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate text-sm font-bold text-[var(--shell-text)]">{student.fullName}</p>
                    <p className={`truncate text-xs ${shellBodyTextClass}`}>{student.email}</p>
                  </div>
                  {student.isAvailable ? (
                    <span className="rounded-full bg-[var(--shell-accent-bg)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--shell-accent)]">
                      {t('create.available')}
                    </span>
                  ) : (
                    <div className="max-w-[160px] text-end">
                      <p className="text-[11px] font-bold text-red-500">{t('create.inOtherGroup')}</p>
                      {student.currentGroup?.name ? (
                        <p className={`truncate text-[10px] ${shellBodyTextClass}`}>
                          {student.currentGroup.name}
                        </p>
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {conflicts.length ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-bold">{t('create.conflictsTitle')}</p>
            <ul className="mt-2 list-disc ps-5">
              {conflicts.map((item) => (
                <li key={item.membership_id}>
                  {item.student_name} — {item.existing_group_name} ({item.existing_group_owner})
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-red-500">
            {t('create.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? t('create.creating') : t('create.done')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddGroupMembersModal
