import { isInstitutionWorkspace } from './workspaceContext'

function buildTestCoreFields(form) {
  const payload = {
    name: form.name.trim(),
    duration_minutes: Number(form.duration_minutes) || 60,
    total_score: Number(form.total_score) || 100,
    passing_score: Number(form.passing_score) || 60,
  }

  const description = form.description?.trim()
  if (description) {
    payload.description = description
  }

  return payload
}

/** POST /tests — backend accepts top-level auto_distribute_scores only at create. */
export function buildCreateTestPayload(form) {
  const payload = {
    ...buildTestCoreFields(form),
    auto_distribute_scores: Boolean(form.auto_distribute_scores),
  }

  if (isInstitutionWorkspace() && form.subject_id) {
    payload.subject_id = Number(form.subject_id)
  }

  return payload
}

export function buildTestStep1Payload(form) {
  return {
    create: buildCreateTestPayload(form),
  }
}

/**
 * PATCH /tests/{id}
 * Backend rejects: auto_distribute_scores, scoring_config, subject_id (create-only / unknown).
 * Match the documented update body: name, description, duration, scores, settings later.
 */
export function buildUpdateTestInfoPayload(form) {
  return buildTestCoreFields(form)
}

export function buildUpdateTestInfoPayloadFromStep1({ create }) {
  const fields = { ...(create || {}) }
  delete fields.subject_id
  delete fields.auto_distribute_scores
  delete fields.scoring_config
  return {
    name: fields.name,
    description: fields.description,
    duration_minutes: fields.duration_minutes,
    total_score: fields.total_score,
    passing_score: fields.passing_score,
  }
}
