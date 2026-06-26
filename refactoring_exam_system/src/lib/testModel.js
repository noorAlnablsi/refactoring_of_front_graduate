export function getTestId(test) {
  return test?.test_id ?? test?.id
}

export function getTestName(test) {
  return test?.name || test?.title || ''
}
