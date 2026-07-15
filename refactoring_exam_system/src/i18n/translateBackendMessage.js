import i18n from './index'

const templateMatchers = new Map()

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildTemplateMatcher(template) {
  if (templateMatchers.has(template)) {
    return templateMatchers.get(template)
  }

  const keys = []
  let regexSource = '^'
  const placeholderPattern = /\{([^}]+)\}/g
  let lastIndex = 0
  let match = placeholderPattern.exec(template)

  while (match) {
    regexSource += escapeRegex(template.slice(lastIndex, match.index))
    keys.push(match[1])
    regexSource += '(.+?)'
    lastIndex = match.index + match[0].length
    match = placeholderPattern.exec(template)
  }

  regexSource += `${escapeRegex(template.slice(lastIndex))}$`

  const matcher = {
    keys,
    regex: new RegExp(regexSource),
  }

  templateMatchers.set(template, matcher)
  return matcher
}

function applyTemplateValues(template, values) {
  let output = template

  for (const [key, value] of Object.entries(values)) {
    output = output.replaceAll(`{${key}}`, value)
  }

  return output
}

function translateWithTemplate(message, dictionary) {
  for (const template of Object.keys(dictionary)) {
    if (!template.includes('{')) continue

    const matcher = buildTemplateMatcher(template)
    const match = message.match(matcher.regex)
    if (!match) continue

    const values = {}
    matcher.keys.forEach((key, index) => {
      values[key] = match[index + 1]
    })

    return applyTemplateValues(dictionary[template], values)
  }

  return null
}

export function translateBackendMessage(message) {
  if (!message || typeof message !== 'string') return message

  const trimmed = message.trim()
  if (!trimmed) return message

  const dictionary = i18n.getResourceBundle(i18n.language, 'backendMessages') || {}

  if (dictionary[trimmed]) {
    return dictionary[trimmed]
  }

  const templated = translateWithTemplate(trimmed, dictionary)
  if (templated) return templated

  return message
}
