export const TEST_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
}

/** Top-level test.availability_time_mode (not TEST_STATUS.SCHEDULED). */
export const TEST_AVAILABILITY_TIME_MODE = {
  FLEXIBLE: 'FLEXIBLE',
  SCHEDULED: 'SCHEDULED',
}

export const TEST_TABS = {
  ALL: 'all',
  PUBLISHED: 'published',
  CORRECTED: 'corrected',
  DRAFTS: 'drafts',
}

export const TEST_WIZARD_STEPS = {
  INFO: 1,
  QUESTIONS: 2,
  SETTINGS: 3,
  REVIEW: 4,
  PUBLISH: 5,
}

export const TEST_SOURCE_TYPE = {
  QUESTION_BANK: 'QUESTION_BANK',
  MANUAL: 'MANUAL',
  RANDOM_FROM_BANK: 'RANDOM_FROM_BANK',
}

export const TEST_WIZARD_STEP_KEYS = ['info', 'questions', 'settings', 'review', 'publish']
