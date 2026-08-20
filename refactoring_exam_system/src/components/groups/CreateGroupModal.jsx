import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Info, Search, UserPlus, X } from 'lucide-react'
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
import {
  addGroupMembers,
  createSubjectGroup,
  getAvailableGroupStudents,
} from '../../services/studentGroups.service'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { useToastStore } from '../../store/toastStore'

function CreateGroupModal({ open, subjects, initialSubjectId, onClose, onSuccess }) {
  const { t } = useTranslation('groups')
  const showToast = useToastStore((s) => s.showToast)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [conflicts, setConflicts] = useState([])

  useEffect(() => {
    if (!open) return
    setStep(1)
    setName('')
    setDescription('')
    setSubjectId(initialSubjectId && initialSubjectId !== 'all' ? String(initialSubjectId) : '')
    setStudents([])
    setSelectedIds([])
    setSearch('')
    setFieldErrors({})
    setConflicts([])
  }, [open, initialSubjectId])

  const filteredStudents = students

  const selectableStudents = students.filter((student) => student.isAvailable)

  const loadStudents = async (sid, searchTerm = '') => {
    setLoadingStudents(true)
    setConflicts([])
    try {
      const data = await getAvailableGroupStudents(sid, {
        search: searchTerm.trim() || undefined,
      })
      setStudents((data.students || []).map(normalizeAvailableStudent))
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.loadFailed'), 'error')
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  useEffect(() => {
    if (!open || step !== 2 || !subjectId) return undefined
    const delay = search.trim() ? 300 : 0
    const timer = window.setTimeout(() => {
      loadStudents(subjectId, search)
    }, delay)
    return () => window.clearTimeout(timer)

  }, [open, step, subjectId, search])

  const validateStep1 = () => {
    const next = {}
    if (!name.trim()) next.name = t('validation.nameRequired')
    if (!subjectId) next.subjectId = t('validation.subjectRequired')
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = async () => {
    if (!validateStep1()) return
    setSearch('')
    setStep(2)
  }

  const toggleStudent = (membershipId, available) => {
    if (!available) return
    setSelectedIds((prev) =>
      prev.includes(membershipId) ? prev.filter((id) => id !== membershipId) : [...prev, membershipId],
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setConflicts([])
    try {
      const created = await createSubjectGroup(subjectId, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      const groupId = created?.group?.id
      if (groupId && selectedIds.length) {
        try {
          await addGroupMembers(groupId, selectedIds)
        } catch (err) {
          const conflict = getGroupConflictPayload(err)
          if (conflict) {
            setConflicts(conflict.conflicts)
            showToast(translateBackendMessage(conflict.message) || t('errors.conflict'), 'error')
            onSuccess?.()
            return
          }
          throw err
        }
      }
      showToast(t('toasts.created'))
      onSuccess?.()
      onClose?.()
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.createFailed'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className={shellModalOverlayClass}>
      <div className={`max-w-2xl ${shellModalPanelClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
              <UserPlus className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <h2 className={`text-lg ${shellPageTitleClass}`}>{t('create.title')}</h2>
              <p className={`mt-1 text-sm ${shellBodyTextClass}`}>
                {step === 1 ? t('create.step1Hint') : t('create.step2Hint')}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            {!subjects.length ? (
              <p className={`rounded-xl bg-[var(--shell-input-bg)] px-4 py-3 text-sm ${shellBodyTextClass}`}>
                {t('create.noAssignableSubjects')}
              </p>
            ) : null}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--shell-text)]">
                {t('create.nameLabel')}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('create.namePlaceholder')}
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs font-semibold text-red-500">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--shell-text)]">
                {t('create.descriptionLabel')}
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('create.descriptionPlaceholder')}
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--shell-text)]">
                {t('create.subjectLabel')}
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
              >
                <option value="" disabled hidden>
                  {t('create.subjectPlaceholder')}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {fieldErrors.subjectId ? (
                <p className="mt-1 text-xs font-semibold text-red-500">{fieldErrors.subjectId}</p>
              ) : null}
            </div>

            <div className="flex gap-3 rounded-xl bg-[var(--shell-accent-bg)] px-4 py-3 text-[var(--shell-accent)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-bold">{t('create.noteTitle')}</p>
                <p className="mt-1 text-xs leading-6 opacity-90">{t('create.noteBody')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-bold text-[var(--shell-accent)]">
              {t('create.selectedCount', {
                selected: formatLocaleNumber(selectedIds.length),
                total: formatLocaleNumber(selectableStudents.length),
              })}
            </p>

            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-text-subtle)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('create.searchPlaceholder')}
                className={`h-11 w-full pe-4 ps-10 text-sm ${shellInputClass}`}
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto rounded-xl ring-1 ring-[var(--shell-border)]">
              {loadingStudents ? (
                <p className={`px-4 py-8 text-center text-sm ${shellBodyTextClass}`}>{t('table.loading')}</p>
              ) : filteredStudents.length === 0 ? (
                <p className={`px-4 py-8 text-center text-sm ${shellBodyTextClass}`}>
                  {t('create.noStudents')}
                </p>
              ) : (
                <ul>
                  {filteredStudents.map((student) => {
                    const checked = selectedIds.includes(student.membershipId)
                    return (
                      <li
                        key={student.membershipId}
                        className={`flex items-center gap-3 border-b border-[var(--shell-border)] px-4 py-3 last:border-0 ${
                          student.isAvailable ? '' : 'opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!student.isAvailable}
                          onChange={() => toggleStudent(student.membershipId, student.isAvailable)}
                          className="h-4 w-4 accent-[var(--shell-accent)]"
                        />
                        <div className="min-w-0 flex-1 text-start">
                          <p className="truncate text-sm font-bold text-[var(--shell-text)]">
                            {student.fullName}
                          </p>
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
                    )
                  })}
                </ul>
              )}
            </div>

            {conflicts.length ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-red-500">
            {t('create.cancel')}
          </button>
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="rounded-xl bg-[var(--shell-input-bg)] px-4 py-2.5 text-sm font-bold text-[var(--shell-text-muted)]"
              >
                {t('create.back')}
              </button>
            ) : null}
            {step === 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!subjects.length}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {t('create.next')}
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {submitting ? t('create.creating') : t('create.done')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
