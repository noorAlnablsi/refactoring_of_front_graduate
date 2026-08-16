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
import { normalizeStudentGroup } from '../../../lib/studentGroupsModel'
import { getStudentMembershipId } from '../../../lib/workspaceStudents'
import { getTeacherMembershipId } from '../../../lib/workspaceTeachers'
import {
  getSurveyAudienceScope,
  getSurveyShareLink,
  isActiveWorkspaceMember,
} from '../../../lib/surveys'
import { SURVEY_AUDIENCE_SCOPE } from '../../../constants/tests'
import {
  assignStudentsToTest,
  getAssignedStudents,
} from '../../../services/tests.service'
import { getSubjectStudents } from '../../../services/subjects.service'
import { getSubjectGroups } from '../../../services/studentGroups.service'
import { getWorkspaceStudents, getWorkspaceTeachers } from '../../../services/workspaces.service'
import { showAppToast } from '../../../lib/appToast'
import { useToastStore } from '../../../store/toastStore'

const inputClassName =
  'h-12 rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-4 text-sm font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

const RECIPIENT_TABS = {
  GROUPS: 'groups',
  INDIVIDUALS: 'individuals',
}

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

function GroupCard({ group, checked, onToggle, studentsLabel }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${
        checked ? 'border-[#2AA8A2] bg-[#F8FDFC]' : 'border-[#E5E9EB] bg-[#FAFBFC]'
      }`}
    >
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-bold text-[#2A3433]">{group.name}</p>
        <p className="mt-1 truncate text-xs text-[#94A3B8]">
          {studentsLabel}
          {group.description ? ` — ${group.description}` : ''}
        </p>
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
  isSurvey = false,
  onPublishNow,
  onSchedule,
  publishing,
  savingDraft = false,
  onBack,
  onSaveDraft,
}) {
  const { t } = useTranslation(['exams', 'surveys', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const testId = getTestId(test)
  const subjectId = test?.subject_id
  const audience = getSurveyAudienceScope(test)
  const showAssign = !isSurvey || audience === SURVEY_AUDIENCE_SCOPE.TARGETED
  const showGroups = showAssign && Boolean(subjectId)
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')
  const [recipientTab, setRecipientTab] = useState(RECIPIENT_TABS.GROUPS)
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedGroupIds, setSelectedGroupIds] = useState([])
  const [loadingRecipients, setLoadingRecipients] = useState(true)
  const activeRecipientTab = showGroups ? recipientTab : RECIPIENT_TABS.INDIVIDUALS

  const shareLink = useMemo(
    () => (isSurvey ? getSurveyShareLink(test) : getExamShareLink(test)),
    [isSurvey, test],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!showAssign) {
        setLoadingRecipients(false)
        return
      }

      if (!subjectId && !testId) {
        setLoadingRecipients(false)
        return
      }

      setLoadingRecipients(true)
      try {
        if (isSurvey && !subjectId) {
          const [studentsRes, teachersRes, assignedRes] = await Promise.all([
            getWorkspaceStudents().catch(() => ({ students: [] })),
            getWorkspaceTeachers().catch(() => ({ teachers: [] })),
            testId ? getAssignedStudents(testId).catch(() => ({ students: [] })) : Promise.resolve({ students: [] }),
          ])

          if (cancelled) return

          const members = [
            ...(studentsRes.students || []).map((student) => ({
              ...student,
              membership_id: getStudentMembershipId(student) ?? student.membership_id,
            })),
            ...(teachersRes.teachers || []).map((teacher) => ({
              full_name: teacher.full_name,
              email: teacher.email,
              membership_id: getTeacherMembershipId(teacher) ?? teacher.membership_id,
            })),
          ].filter((member) => member.membership_id && isActiveWorkspaceMember(member))

          const unique = []
          const seen = new Set()
          members.forEach((member) => {
            const id = Number(member.membership_id)
            if (!id || seen.has(id)) return
            seen.add(id)
            unique.push({ ...member, membership_id: id })
          })

          setStudents(unique)
          setGroups([])
          setRecipientTab(RECIPIENT_TABS.INDIVIDUALS)

          const assignedIds = (assignedRes.students || [])
            .map((student) => Number(student.membership_id))
            .filter(Boolean)
          setSelectedStudentIds(assignedIds)
          return
        }

        const [subjectStudentsRes, assignedRes, groupsRes] = await Promise.all([
          subjectId
            ? getSubjectStudents(subjectId)
            : Promise.resolve({ students: [] }),
          testId
            ? getAssignedStudents(testId).catch(() => ({ students: [] }))
            : Promise.resolve({ students: [] }),
          subjectId
            ? getSubjectGroups(subjectId).catch(() => ({ groups: [] }))
            : Promise.resolve({ groups: [] }),
        ])

        if (cancelled) return

        const list = (subjectStudentsRes.students || []).map((student) => ({
          ...student,
          membership_id: getStudentMembershipId(student) ?? student.membership_id,
        }))

        const normalizedGroups = (groupsRes.groups || groupsRes || [])
          .map(normalizeStudentGroup)
          .filter(Boolean)

        setStudents(list)
        setGroups(normalizedGroups)

        const assignedIds = (assignedRes.students || [])
          .map((student) => Number(student.membership_id))
          .filter(Boolean)

        setSelectedStudentIds(assignedIds)
      } catch (err) {
        if (!cancelled) showToast(err.message, 'error')
      } finally {
        if (!cancelled) setLoadingRecipients(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isSurvey, showAssign, subjectId, testId, showToast])

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) => {
      const name = (student.full_name || '').toLowerCase()
      const email = (student.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [searchQuery, students])

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return groups
    return groups.filter((group) => {
      const name = (group.name || '').toLowerCase()
      const description = (group.description || '').toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }, [searchQuery, groups])

  const estimatedRecipients = useMemo(() => {
    const fromGroups = groups
      .filter((group) => selectedGroupIds.includes(Number(group.id)))
      .reduce((sum, group) => sum + (Number(group.studentCount) || 0), 0)
    return fromGroups + selectedStudentIds.length
  }, [groups, selectedGroupIds, selectedStudentIds])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      showAppToast(
        isSurvey ? 'toast.linkCopied' : 'wizard.publish.linkCopied',
        'success',
        { ns: isSurvey ? 'surveys' : 'exams' },
      )
    } catch {
      showAppToast('wizard.publish.linkCopyFailed', 'error', { ns: 'exams' })
    }
  }

  const toggleStudent = (membershipId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(membershipId)
        ? prev.filter((id) => id !== membershipId)
        : [...prev, membershipId],
    )
  }

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    )
  }

  const syncAssignments = async () => {
    if (!testId) return
    if (selectedStudentIds.length === 0 && selectedGroupIds.length === 0) return
    await assignStudentsToTest(testId, {
      studentMembershipIds: selectedStudentIds,
      groupIds: selectedGroupIds,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (isSurvey) {
        if (audience === SURVEY_AUDIENCE_SCOPE.TARGETED) {
          if (selectedStudentIds.length === 0 && selectedGroupIds.length === 0) {
            showAppToast('toast.targetedRequired', 'error', { ns: 'surveys' })
            return
          }
          await syncAssignments()
        }
        onPublishNow?.()
        return
      }

      await syncAssignments()

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
        <p className="text-sm font-bold text-[#2AA8A2]">
          {isSurvey ? t('wizard.publish.eyebrow', { ns: 'surveys' }) : t('wizard.publish.eyebrow', { ns: 'exams' })}
        </p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          {isSurvey ? t('wizard.publish.title', { ns: 'surveys' }) : t('wizard.publish.title', { ns: 'exams' })}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          {isSurvey ? t('wizard.publish.subtitle', { ns: 'surveys' }) : t('wizard.publish.subtitle', { ns: 'exams' })}
        </p>
      </header>

      {!isSurvey ? (
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
      ) : null}

      <WizardSection
        icon={Link2}
        title={isSurvey ? t('wizard.publish.shareTitle', { ns: 'surveys' }) : t('wizard.publish.shareTitle', { ns: 'exams' })}
      >
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
        {isSurvey ? (
          <p className="mt-3 text-xs leading-6 text-[#94A3B8]">
            {t('wizard.publish.shareHint', { ns: 'surveys' })}
          </p>
        ) : null}
      </WizardSection>

      {showAssign ? (
      <WizardSection
        icon={Users}
        title={isSurvey ? t('wizard.publish.assignTitle', { ns: 'surveys' }) : t('wizard.publish.recipientsTitle', { ns: 'exams' })}
      >
        {isSurvey ? (
          <p className="mb-4 text-sm leading-7 text-[#64748B]">
            {t('wizard.publish.assignHint', { ns: 'surveys' })}
          </p>
        ) : null}
        {showGroups ? (
        <div className="mb-4 flex gap-2 rounded-xl bg-[#F6F8F9] p-1">
          <button
            type="button"
            onClick={() => {
              setRecipientTab(RECIPIENT_TABS.GROUPS)
              setSearchQuery('')
            }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              recipientTab === RECIPIENT_TABS.GROUPS
                ? 'bg-white text-[#2AA8A2] shadow-sm'
                : 'text-[#64748B]'
            }`}
          >
            {t('wizard.publish.tabGroups', { ns: 'exams' })}
          </button>
          <button
            type="button"
            onClick={() => {
              setRecipientTab(RECIPIENT_TABS.INDIVIDUALS)
              setSearchQuery('')
            }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              recipientTab === RECIPIENT_TABS.INDIVIDUALS
                ? 'bg-white text-[#2AA8A2] shadow-sm'
                : 'text-[#64748B]'
            }`}
          >
            {t('wizard.publish.tabIndividuals', { ns: 'exams' })}
          </button>
        </div>
        ) : null}

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              activeRecipientTab === RECIPIENT_TABS.GROUPS
                ? t('wizard.publish.searchGroupPlaceholder', { ns: 'exams' })
                : t('wizard.publish.searchStudentPlaceholder', { ns: 'exams' })
            }
            className={`${inputClassName} w-full pr-11`}
          />
        </div>

        {loadingRecipients ? (
          <p className="text-sm text-[#64748B]">{t('wizard.publish.loadingRecipients', { ns: 'exams' })}</p>
        ) : activeRecipientTab === RECIPIENT_TABS.GROUPS ? (
          filteredGroups.length === 0 ? (
            <p className="text-sm text-[#64748B]">{t('wizard.publish.noGroups', { ns: 'exams' })}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredGroups.map((group) => {
                const groupId = Number(group.id)
                if (!groupId) return null
                return (
                  <GroupCard
                    key={groupId}
                    group={group}
                    checked={selectedGroupIds.includes(groupId)}
                    onToggle={() => toggleGroup(groupId)}
                    studentsLabel={t('wizard.publish.groupStudentsCount', {
                      ns: 'exams',
                      count: group.studentCount,
                    })}
                  />
                )
              })}
            </div>
          )
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
                  checked={selectedStudentIds.includes(membershipId)}
                  onToggle={() => toggleStudent(membershipId)}
                />
              )
            })}
          </div>
        )}

        <p className="mt-4 text-sm font-bold text-[#2A3433]">
          {t('wizard.publish.totalRecipients', { ns: 'exams', count: estimatedRecipients })}
        </p>
        <p className="mt-1 text-xs text-[#94A3B8]">
          {isSurvey
            ? t('wizard.publish.identityNote', { ns: 'surveys' })
            : t('wizard.publish.recipientsHint', { ns: 'exams' })}
        </p>
      </WizardSection>
      ) : null}

      <ExamWizardFooter>
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
            data-keyboard-primary=""
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-60"
          >
            {publishing
              ? t('wizard.publish.publishing', { ns: 'exams' })
              : isSurvey
                ? t('wizard.publish.publishNow', { ns: 'surveys' })
                : t('wizard.publish.publishExam', { ns: 'exams' })}
            <Rocket className="h-4 w-4" />
          </button>
        </div>
      </ExamWizardFooter>
    </form>
  )
}

export default ExamPublishStep
