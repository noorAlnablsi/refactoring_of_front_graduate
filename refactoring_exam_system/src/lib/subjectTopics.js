export function extractTopicsList(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  if (Array.isArray(payload.topics)) return payload.topics
  if (Array.isArray(payload.subject_topics)) return payload.subject_topics
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items

  return []
}
