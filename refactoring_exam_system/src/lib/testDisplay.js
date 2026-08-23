import { ROUTES } from '../constants/routes'
import { TEST_AVAILABILITY_TIME_MODE, TEST_STATUS, TEST_TABS } from '../constants/tests'
import { tUI } from './appToast'
import { getTestId } from './testModel'
import { isExamFullyGraded } from './testGradingDisplay'

function parseLocalDateTimeMs(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    const year = Number(match[1].slice(0, 4))
    const month = Number(match[1].slice(5, 7)) - 1
    const day = Number(match[1].slice(8, 10))
    const hour = Number(match[2])
    const minute = Number(match[3])
    const second = Number(match[4] || 0)
    const ms = new Date(year, month, day, hour, minute, second).getTime()
    return Number.isNaN(ms) ? null : ms
  }
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function canShowCloseExamButton(test, nowMs = Date.now()) {
  if (!test || test.status !== TEST_STATUS.PUBLISHED) return false

  const mode = String(
    test.availability_time_mode || test.availability_mode || '',
  ).toUpperCase()

  if (mode === TEST_AVAILABILITY_TIME_MODE.FLEXIBLE || mode === TEST_AVAILABILITY_TIME_MODE.SURVEY || (!mode && test.closed_at)) {
    const closedAtMs = parseLocalDateTimeMs(test.closed_at)
    if (closedAtMs != null && nowMs >= closedAtMs) return false
  }

  if (mode === TEST_AVAILABILITY_TIME_MODE.SCHEDULED || (test.starts_at && test.duration_minutes)) {
    const startsAtMs = parseLocalDateTimeMs(test.starts_at)
    const duration = Number(test.duration_minutes)
    if (startsAtMs != null && Number.isFinite(duration) && duration > 0) {
      const globalEndMs = startsAtMs + duration * 60 * 1000
      if (nowMs >= globalEndMs) return false
    }
  }

  return true
}

export const TEST_STATUS_STYLES = {
  [TEST_STATUS.DRAFT]: 'bg-[#F1F5F9] text-[#64748B]',
  [TEST_STATUS.SCHEDULED]: 'bg-[#FEF3C7] text-[#B45309]',
  [TEST_STATUS.PUBLISHED]: 'bg-[#E8F7F6] text-[#2AA8A2]',
  [TEST_STATUS.CLOSED]: 'bg-[#EEF2FF] text-[#4F46E5]',
  [TEST_STATUS.ARCHIVED]: 'bg-[#F1F5F9] text-[#94A3B8]',
}

export const TEST_FULLY_GRADED_BADGE_STYLE = 'bg-[#DCFCE7] text-[#15803D]'

export function getTestStatusLabel(status) {
  if (!status) return '—'
  return tUI(`status.${status}`, { ns: 'exams', defaultValue: status })
}

export function getExamDisplayStatusLabel(test) {
  if (isExamFullyGraded(test)) {
    return tUI('gradingDisplay.fullyGraded', { ns: 'exams' })
  }
  return getTestStatusLabel(test?.status)
}

export function filterTestsByTab(tests = [], tab) {
  if (tab === TEST_TABS.ALL) {
    return tests.filter((test) => test.status !== TEST_STATUS.ARCHIVED)
  }
  if (tab === TEST_TABS.PUBLISHED) {
    return tests.filter((test) => test.status === TEST_STATUS.PUBLISHED)
  }
  if (tab === TEST_TABS.DRAFT || tab === TEST_TABS.DRAFTS) {
    if (tab === TEST_TABS.DRAFT) {
      return tests.filter((test) => test.status === TEST_STATUS.DRAFT)
    }
    return tests.filter(
      (test) => test.status === TEST_STATUS.DRAFT || test.status === TEST_STATUS.SCHEDULED,
    )
  }
  if (tab === TEST_TABS.SCHEDULED) {
    return tests.filter((test) => test.status === TEST_STATUS.SCHEDULED)
  }
  if (tab === TEST_TABS.CLOSED) {
    return tests.filter((test) => test.status === TEST_STATUS.CLOSED)
  }
  if (tab === TEST_TABS.CORRECTED) {
    return tests.filter((test) => isExamFullyGraded(test))
  }
  return tests
}

export function getExamListStatusQuery(tab) {
  if (tab === TEST_TABS.DRAFT) return { status: TEST_STATUS.DRAFT }
  if (tab === TEST_TABS.SCHEDULED) return { status: TEST_STATUS.SCHEDULED }
  if (tab === TEST_TABS.PUBLISHED) return { status: TEST_STATUS.PUBLISHED }
  if (tab === TEST_TABS.CLOSED) return { status: TEST_STATUS.CLOSED }
  return {}
}

export function getTestQuestionsCount(test) {
  if (!test) return 0

  const countCandidates = [
    test.questions_count,
    test.question_count,
    test.questionsCount,
    test.questionCount,
    test.total_questions,
    test.totalQuestions,
    test.num_questions,
    test.questions_total,
  ]

  for (const candidate of countCandidates) {
    if (candidate != null && candidate !== '') {
      const n = Number(candidate)
      if (Number.isFinite(n) && n >= 0) return n
    }
  }

  if (Array.isArray(test.questions)) {
    return test.questions.length
  }

  return 0
}

export function getTestTotalPoints(test) {
  const questions = test?.questions || []
  if (!questions.length) return test?.total_score || 0
  return questions.reduce((sum, q) => sum + (Number(q.snapshot_points ?? q.points) || 0), 0)
}

export function getTestParticipantsCount(test) {
  const value = test?.participants_count ?? test?.participantsCount
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function getTestAverageScore(test) {
  const value = test?.average_score ?? test?.averageScore
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000

export function canEditTest(test) {
  if (!test) return false
  const status = String(test.status || '').toUpperCase()

  if (status === TEST_STATUS.DRAFT) return true
  // Published exams may still need settings fixes (e.g. max_attempts).
  if (status === TEST_STATUS.PUBLISHED) return true

  if (status === TEST_STATUS.SCHEDULED) {
    const publishAtMs = parseLocalDateTimeMs(test.scheduled_publish_at)
    if (publishAtMs == null) return false
    return publishAtMs - Date.now() >= THIRTY_MINUTES_MS
  }

  return false
}

export function getEditBlockedMessage(test) {
  if (!test) return tUI('errors.testNotFound', { ns: 'exams' })

  const status = String(test.status || '').toUpperCase()

  if (status === TEST_STATUS.DRAFT || status === TEST_STATUS.PUBLISHED) return ''

  if (status === TEST_STATUS.SCHEDULED) {
    const publishAtMs = parseLocalDateTimeMs(test.scheduled_publish_at)
    if (publishAtMs == null) {
      return tUI('errors.editMissingPublishAt', { ns: 'exams' })
    }
    if (publishAtMs - Date.now() < THIRTY_MINUTES_MS) {
      return tUI('errors.editTooCloseToPublish', { ns: 'exams' })
    }
    return ''
  }

  return tUI('errors.editDraftOrScheduledOnly', { ns: 'exams' })
}

export function getSourceTypeLabel(sourceType) {
  if (!sourceType) return '—'
  return tUI(`sourceType.${sourceType}`, { ns: 'exams', defaultValue: sourceType })
}

export function getExamShareLink(test) {
  if (test?.share_url) return test.share_url
  if (test?.public_url) return test.public_url

  const testId = getTestId(test)
  if (testId == null || testId === '') {
    return `${window.location.origin}${ROUTES.STUDENT_EXAMS}`
  }

  const path = ROUTES.STUDENT_EXAM_ENTRY.replace(':testId', String(testId))
  return `${window.location.origin}${path}`
}
