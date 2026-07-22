import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  CalendarClock,
  Copy,
  Link2,
  Rocket,
  Search,
  Users,
} from 'lucide-react'
import ExamWizardFooter from '../ExamWizardFooter'
import WizardSection from '../WizardSection'
import { toNaiveLocalDateTime } from '../../../lib/examPublishTime'
import { getExamShareLink } from '../../../lib/testDisplay'
import { getTestId } from '../../../lib/testModel'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import {
  assignStudentsToTest,
  getAssignedStudents,
} from '../../../services/tests.service'
import { getSubjectStudents } from '../../../services/subjects.service'
import { showAppToast } from '../../../lib/appToast'
import { useToastStore } from '../../../store/toastStore'

const inputClassName =
  'h-12 rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-4 text-sm font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

function StudentCard({ student, checked, onToggle }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${
        checked ? 'border-[#2AA8A2] bg-[#F8FDFC]' : 'border-[#E5E9EB] bg-[#FAFBFC]'
      }`}
    >
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-bold text-[#2A3433]">{student.full_name}</p>
        <p className="mt-1 truncate text-xs text-[#94A3B8]">{student.email || '—'}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 accent-[#2AA8A2]"
      />
    </label>
  )
}

function ExamPublishStep({
  test,
  onPublishNow,
  onSchedule,
  publishing,
  savingDraft = false,
  onBack,
  onSaveDraft,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const testId = getTestId(test)
  const subjectId = test?.subject_id
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  const shareLink = useMemo(() => getExamShareLink(test), [test])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!subjectId && !testId) {
        setLoadingStudents(false)
        return
      }

      setLoadingStudents(true)
      try {
        const [subjectStudentsRes, assignedRes] = await Promise.all([
          subjectId
            ? getSubjectStudents(subjectId)
            : Promise.resolve({ students: [] }),
          testId
            ? getAssignedStudents(testId).catch(() => ({ students: [] }))
            : Promise.resolve({ students: [] }),
        ])

        if (cancelled) return

        const list = (subjectStudentsRes.students || []).map((student) => ({
          ...student,
          membership_id: getStudentMembershipId(student) ?? student.membership_id,
        }))

        setStudents(list)

        const assignedIds = (assignedRes.students || [])
          .map((student) => Number(student.membership_id))
          .filter(Boolean)

        setSelectedIds(assignedIds.length ? assignedIds : list.map((s) => Number(s.membership_id)).filter(Boolean))
      } catch (err) {
        if (!cancelled) showToast(err.message, 'error')
      } finally {
        if (!cancelled) setLoadingStudents(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [subjectId, testId, showToast])

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) => {
      const name = (student.full_name || '').toLowerCase()
      const email = (student.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [studentSearch, students])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      showAppToast('wizard.publish.linkCopied', 'success', { ns: 'exams' })
    } catch {
      showAppToast('wizard.publish.linkCopyFailed', 'error', { ns: 'exams' })
    }
  }

  const toggleStudent = (membershipId) => {
    setSelectedIds((prev) =>
      prev.includes(membershipId)
        ? prev.filter((id) => id !== membershipId)
        : [...prev, membershipId],
    )
  }

  const syncAssignments = async () => {
    if (!testId || selectedIds.length === 0) return
    await assignStudentsToTest(testId, selectedIds)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (selectedIds.length > 0) {
        await syncAssignments()
      }

      if (!publishDate && !publishTime) {
        onPublishNow?.()
        return
      }

      if (!publishDate || !publishTime) {
        showAppToast('wizard.publish.scheduleBothRequired', 'error', { ns: 'exams' })
        return
      }

      const publishAt = new Date(`${publishDate}T${publishTime}`)
      if (Number.isNaN(publishAt.getTime())) {
        showAppToast('wizard.publish.invalidSchedule', 'error', { ns: 'exams' })
        return
      }

      const publish_at = toNaiveLocalDateTime(publishAt)
      if (!publish_at) {
        showAppToast('wizard.publish.invalidSchedule', 'error', { ns: 'exams' })
        return
      }

      onSchedule?.({ publish_at })
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.publish.eyebrow', { ns: 'exams' })}</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {t('wizard.publish.title', { ns: 'exams' })}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          {t('wizard.publish.subtitle', { ns: 'exams' })}
        </p>
      </header>

      <WizardSection icon={CalendarClock} title={t('wizard.publish.scheduleTitle', { ns: 'exams' })}>
        <p className="text-sm leading-7 text-[#64748B]">
          {t('wizard.publish.scheduleHint', { ns: 'exams' })}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
              {t('wizard.publish.publishDateLabel', { ns: 'exams' })}
            </label>
            <input
              type="date"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
              {t('wizard.publish.publishTimeLabel', { ns: 'exams' })}
            </label>
            <input
              type="time"
              value={publishTime}
              onChange={(event) => setPublishTime(event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-[#94A3B8]">{t('wizard.publish.immediateHint', { ns: 'exams' })}</p>
      </WizardSection>

      <WizardSection icon={Link2} title={t('wizard.publish.shareTitle', { ns: 'exams' })}>
        <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
          {t('wizard.publish.directLink', { ns: 'exams' })}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={shareLink}
            className={`${inputClassName} min-w-0 flex-1 text-left`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)]"
          >
            <Copy className="h-4 w-4" />
            {t('wizard.publish.copy', { ns: 'exams' })}
          </button>
        </div>
      </WizardSection>

      <WizardSection icon={Users} title={t('wizard.publish.studentsTitle', { ns: 'exams' })}>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
            placeholder={t('wizard.publish.searchStudentPlaceholder', { ns: 'exams' })}
            className={`${inputClassName} w-full pr-11`}
          />
        </div>

        {loadingStudents ? (
          <p className="text-sm text-[#64748B]">{t('wizard.publish.loadingStudents', { ns: 'exams' })}</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-sm text-[#64748B]">{t('wizard.publish.noStudents', { ns: 'exams' })}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredStudents.map((student) => {
              const membershipId = Number(student.membership_id)
              if (!membershipId) return null

              return (
                <StudentCard
                  key={membershipId}
                  student={student}
                  checked={selectedIds.includes(membershipId)}
                  onToggle={() => toggleStudent(membershipId)}
                />
              )
            })}
          </div>
        )}

        <p className="mt-3 text-xs text-[#94A3B8]">
          {t('wizard.publish.selectedCount', { ns: 'exams', count: selectedIds.length })}
        </p>
      </WizardSection>

      <ExamWizardFooter className="-mx-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('wizard.questions.review.back', { ns: 'exams' })}
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
          >
            {savingDraft
              ? t('wizard.basicInfo.savingDraft', { ns: 'exams' })
              : t('wizard.basicInfo.saveDraft', { ns: 'exams' })}
          </button>

          <button
            type="submit"
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-60"
          >
            {publishing
              ? t('wizard.publish.publishing', { ns: 'exams' })
              : t('wizard.publish.publishNow', { ns: 'exams' })}
            <Rocket className="h-4 w-4" />
          </button>
        </div>
      </ExamWizardFooter>
    </form>
  )
}

export default ExamPublishStep
