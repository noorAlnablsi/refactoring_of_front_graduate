import { TEST_STATUS, TEST_TABS } from '../constants/tests'
import { tUI } from './appToast'
import { getTestId } from './testModel'

export const TEST_STATUS_STYLES = {
  [TEST_STATUS.DRAFT]: 'bg-[#F1F5F9] text-[#64748B]',
  [TEST_STATUS.SCHEDULED]: 'bg-[#E8F7F6] text-[#2AA8A2]',
  [TEST_STATUS.PUBLISHED]: 'bg-[#E8F7F6] text-[#2AA8A2]',
  [TEST_STATUS.CLOSED]: 'bg-[#EEF2FF] text-[#4F46E5]',
  [TEST_STATUS.ARCHIVED]: 'bg-[#F1F5F9] text-[#94A3B8]',
}

export function getTestStatusLabel(status) {
  if (!status) return '—'
  return tUI(`status.${status}`, { ns: 'exams', defaultValue: status })
}

export function filterTestsByTab(tests = [], tab) {
  if (tab === TEST_TABS.ALL) {
    return tests.filter((test) => test.status !== TEST_STATUS.ARCHIVED)
  }
  if (tab === TEST_TABS.PUBLISHED) {
    return tests.filter((test) => test.status === TEST_STATUS.PUBLISHED)
  }
  if (tab === TEST_TABS.CORRECTED) {
    return tests.filter((test) => test.status === TEST_STATUS.CLOSED)
  }
  if (tab === TEST_TABS.DRAFTS) {
    return tests.filter(
      (test) => test.status === TEST_STATUS.DRAFT || test.status === TEST_STATUS.SCHEDULED,
    )
  }
  return tests
}

export function getTestQuestionsCount(test) {
  if (Array.isArray(test?.questions) && test.questions.length > 0) {
    return test.questions.length
  }

  const count = test?.questions_count ?? test?.question_count
  if (count != null && count !== '') {
    return Number(count) || 0
  }

  return 0
}

export function getTestTotalPoints(test) {
  const questions = test?.questions || []
  if (!questions.length) return test?.total_score || 0
  return questions.reduce((sum, q) => sum + (Number(q.snapshot_points ?? q.points) || 0), 0)
}

export function canEditTest(test) {
  if (!test) return false
  if (test.status !== TEST_STATUS.DRAFT) return false
  if (!test.starts_at) return true

  const startsAt = new Date(test.starts_at).getTime()
  if (Number.isNaN(startsAt)) return true

  const thirtyMinutesMs = 30 * 60 * 1000
  return startsAt - Date.now() >= thirtyMinutesMs
}

export function getEditBlockedMessage(test) {
  if (!test) return tUI('errors.testNotFound', { ns: 'exams' })
  if (test.status !== TEST_STATUS.DRAFT) {
    return tUI('errors.editDraftOnly', { ns: 'exams' })
  }
  if (test.starts_at) {
    const startsAt = new Date(test.starts_at).getTime()
    const thirtyMinutesMs = 30 * 60 * 1000
    if (!Number.isNaN(startsAt) && startsAt - Date.now() < thirtyMinutesMs) {
      return tUI('errors.editTooCloseToStart', { ns: 'exams' })
    }
  }
  return ''
}

export function getSourceTypeLabel(sourceType) {
  if (!sourceType) return '—'
  return tUI(`sourceType.${sourceType}`, { ns: 'exams', defaultValue: sourceType })
}

export function getExamShareLink(test) {
  if (test?.share_url) return test.share_url
  if (test?.public_url) return test.public_url

  const testId = getTestId(test)
  const slug = test?.slug
  const path = slug ? `/exams/${slug}` : testId ? `/exams/${testId}` : '/exams'
  return `${window.location.origin}${path}`
}
