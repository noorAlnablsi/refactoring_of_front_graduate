import { getQuestionBankById } from '../../../../services/questionBanks.service'

export async function resolveBankById(bankId) {
  if (!bankId) return null
  try {
    const data = await getQuestionBankById(bankId)
    return data.question_bank || data
  } catch {
    return null
  }
}

export async function resolveBanksByIds(bankIds = []) {
  const banks = await Promise.all(bankIds.map((bankId) => resolveBankById(bankId)))
  return banks.filter(Boolean)
}
