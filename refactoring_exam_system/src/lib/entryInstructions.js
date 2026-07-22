/**
 * Entry-screen instructions: prefer localized UI copy when UI language is Arabic
 * and backend returns generic English defaults.
 */
const ENGLISH_DEFAULT_MARKERS = [
  'ensure that your internet',
  'allow camera and microphone',
  'do not leave the exam page',
  'timer expires',
  'answer all questions',
]

function looksLikeEnglishDefaults(instructions = []) {
  if (!instructions.length) return false
  const joined = instructions.join(' ').toLowerCase()
  return ENGLISH_DEFAULT_MARKERS.some((marker) => joined.includes(marker))
}

export function resolveEntryInstructions(backendInstructions = [], { language, t }) {
  const localized = t('entry.instructionsList', { returnObjects: true })
  const hasLocalized = Array.isArray(localized) && localized.length > 0

  if (language?.startsWith('ar') && hasLocalized) {
    if (!backendInstructions.length || looksLikeEnglishDefaults(backendInstructions)) {
      return localized
    }
  }

  if (backendInstructions.length) return backendInstructions
  return hasLocalized ? localized : []
}
