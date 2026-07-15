import { tUI } from './appToast'

const DEFAULT_DIFFICULTY = { easy: 30, medium: 50, hard: 20 }

function defaultTopicName(topicId) {
  return tUI('blueprint.defaultTopic', { ns: 'exams', id: topicId })
}

export function resolveBankSubjectId(bank) {
  return bank?.subject_id ?? bank?.subject?.id ?? bank?.subject?.subject_id ?? bank?.subjectId ?? null
}

export function extractTopicsFromQuestions(questions = []) {
  const map = new Map()

  questions.forEach((question) => {
    const topicId = question?.topic_id ?? question?.snapshot_topic_id
    if (topicId == null || topicId === '') return

    const name =
      question?.topic_name ??
      question?.snapshot_topic_name ??
      question?.topic?.name ??
      defaultTopicName(topicId)

    if (!map.has(topicId)) {
      map.set(topicId, { topic_id: topicId, name })
    }
  })

  return [...map.values()]
}

export function mapSubjectTopicsToBlueprint(topics = []) {
  return (topics || []).map((topic) => ({
    topic_id: topic.id ?? topic.topic_id,
    name: topic.name ?? topic.title ?? defaultTopicName(topic.id),
  }))
}

export function splitEqualPercentages(count) {
  if (count <= 0) return []

  const base = Math.floor(100 / count)
  const remainder = 100 - base * count

  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0))
}

export function createDefaultTopicConfig(topic, percentage = 0) {
  return {
    topic_id: topic.topic_id,
    name: topic.name,
    percentage,
    difficulty: { ...DEFAULT_DIFFICULTY },
  }
}

export function createDefaultBankBlueprint(bank, topics) {
  const percentages = splitEqualPercentages(topics.length)

  return {
    bank_id: bank.id,
    bank,
    question_count: topics.length > 0 ? 10 : 0,
    topics: topics.map((topic, index) => createDefaultTopicConfig(topic, percentages[index] ?? 0)),
  }
}

export function getActiveBlueprintTopics(topics = []) {
  return topics.filter((topic) => Number(topic.percentage) > 0)
}

export function getBlueprintTotalQuestions(blueprints = []) {
  return blueprints.reduce((sum, bank) => sum + (Number(bank.question_count) || 0), 0)
}

export function isPercentageSumValid(values) {
  const total = values.reduce((sum, value) => sum + (Number(value) || 0), 0)
  return total === 100
}

export function validateBlueprintHealth(blueprints = []) {
  const weightsValid =
    blueprints.length > 0 &&
    blueprints.every((bank) => {
      const activeTopics = getActiveBlueprintTopics(bank.topics)
      return (
        activeTopics.length > 0 &&
        isPercentageSumValid(activeTopics.map((topic) => topic.percentage))
      )
    })

  const difficultyValid =
    blueprints.length > 0 &&
    blueprints.every((bank) =>
      getActiveBlueprintTopics(bank.topics).every((topic) =>
        isPercentageSumValid([topic.difficulty.easy, topic.difficulty.medium, topic.difficulty.hard]),
      ),
    )

  const totalQuestions = getBlueprintTotalQuestions(blueprints)
  const hasQuestions = totalQuestions >= 1

  return {
    weightsValid,
    difficultyValid,
    totalQuestions,
    isValid: weightsValid && difficultyValid && hasQuestions,
  }
}

export function buildRandomFromBanksPayload(blueprints = []) {
  return {
    banks: blueprints.map((bank) => ({
      bank_id: Number(bank.bank_id),
      question_count: Number(bank.question_count) || 0,
      topics: getActiveBlueprintTopics(bank.topics).map((topic) => ({
        topic_id: Number(topic.topic_id),
        percentage: Number(topic.percentage) || 0,
        difficulty_distribution: {
          easy: Number(topic.difficulty.easy) || 0,
          medium: Number(topic.difficulty.medium) || 0,
          hard: Number(topic.difficulty.hard) || 0,
        },
      })),
    })),
  }
}
