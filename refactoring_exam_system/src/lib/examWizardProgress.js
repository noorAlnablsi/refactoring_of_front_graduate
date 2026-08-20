import { TEST_WIZARD_STEPS } from '../constants/tests'
import { getTestQuestionsCount } from './testDisplay'
import { getTestName } from './testModel'

const STORAGE_PREFIX = 'exam-wizard-progress:'

export const EXAM_QUESTIONS_VIEWS = {
  METHOD_PICKER: 'method-picker',
  FROM_BANK_QUESTIONS: 'from-bank-questions',
  MANUAL: 'manual',
  RANDOM_BLUEPRINT: 'random-blueprint',
  REVIEW: 'review',
}

function getStorageKey(testId) {
  return `${STORAGE_PREFIX}${testId}`
}

export function getExamWizardProgress(testId) {
  if (!testId) return null

  try {
    const raw = localStorage.getItem(getStorageKey(testId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveExamWizardProgress(testId, progress) {
  if (!testId || !progress) return

  const current = getExamWizardProgress(testId) || {}
  const next = {
    ...current,
    ...progress,
    updatedAt: new Date().toISOString(),
  }

  if (progress.questions === null) {
    delete next.questions
  }

  localStorage.setItem(getStorageKey(testId), JSON.stringify(next))
}

export function clearExamWizardProgress(testId) {
  if (!testId) return
  localStorage.removeItem(getStorageKey(testId))
}

export function getMaxReachableWizardStep(test) {
  if (!test) return TEST_WIZARD_STEPS.INFO

  const name = String(getTestName(test) || '').trim()
  if (!name) return TEST_WIZARD_STEPS.INFO

  const questionsCount = getTestQuestionsCount(test)
  if (questionsCount < 1) return TEST_WIZARD_STEPS.QUESTIONS

  if (!hasSavedSettings(test)) return TEST_WIZARD_STEPS.SETTINGS

  return TEST_WIZARD_STEPS.PUBLISH
}

export function getResumeWizardStep(test, progress) {
  const maxReachable = getMaxReachableWizardStep(test)
  const saved = Number(progress?.step)

  if (saved >= TEST_WIZARD_STEPS.INFO && saved <= TEST_WIZARD_STEPS.PUBLISH) {
    return Math.min(saved, maxReachable)
  }

  return inferWizardStepFromTest(test)
}

function hasSavedSettings(test) {
  const config = test?.settings_config
  if (!config || typeof config !== 'object') return false
  return Object.keys(config).length > 0
}

export function inferWizardStepFromTest(test) {
  if (!test) return TEST_WIZARD_STEPS.INFO

  const name = String(getTestName(test) || '').trim()
  if (!name) return TEST_WIZARD_STEPS.INFO

  const questionsCount = getTestQuestionsCount(test)
  if (questionsCount < 1) return TEST_WIZARD_STEPS.QUESTIONS

  if (!hasSavedSettings(test)) return TEST_WIZARD_STEPS.SETTINGS

  return TEST_WIZARD_STEPS.REVIEW
}
