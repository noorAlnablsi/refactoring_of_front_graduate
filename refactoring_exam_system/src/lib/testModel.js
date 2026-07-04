export function getTestId(test) {
  return test?.test_id ?? test?.id
}

export function getTestName(test) {
  return test?.name || test?.title || ''
}

export function mergeTestPreservingQuestions(previous, next) {
  const testData = next?.test || next
  if (!testData) return previous || null

  if (
    (!Array.isArray(testData.questions) || testData.questions.length === 0) &&
    Array.isArray(previous?.questions) &&
    previous.questions.length > 0
  ) {
    return { ...testData, questions: previous.questions }
  }

  return testData
}
