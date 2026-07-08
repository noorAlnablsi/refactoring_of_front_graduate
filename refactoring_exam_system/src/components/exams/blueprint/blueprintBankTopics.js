import {
  createDefaultBankBlueprint,
  extractTopicsFromQuestions,
  mapSubjectTopicsToBlueprint,
  resolveBankSubjectId,
} from '../../../lib/examBlueprint'
import { getQuestionBankQuestions } from '../../../services/questionBanks.service'
import { getSubjectTopics } from '../../../services/subjects.service'

export async function loadBankTopics(bank) {
  const questionsResult = await getQuestionBankQuestions(bank.id).catch(() => ({ questions: [] }))
  const fromQuestions = extractTopicsFromQuestions(questionsResult.questions || [])

  if (fromQuestions.length > 0) return fromQuestions

  const subjectId = resolveBankSubjectId(bank)
  if (!subjectId) return []

  const topicsData = await getSubjectTopics(subjectId).catch(() => ({ topics: [] }))
  return mapSubjectTopicsToBlueprint(topicsData.topics || topicsData || [])
}

export async function loadBlueprintsForBanks(banks) {
  return Promise.all(
    banks.map(async (bank) => {
      const topics = await loadBankTopics(bank)
      return createDefaultBankBlueprint(bank, topics)
    }),
  )
}
