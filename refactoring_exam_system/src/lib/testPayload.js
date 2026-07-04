import { isInstitutionWorkspace } from './workspaceContext'

function buildTestCoreFields(form) {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    duration_minutes: Number(form.duration_minutes) || 60,
    total_score: Number(form.total_score) || 100,
    passing_score: Number(form.passing_score) ?? 60,
  }
}

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

export function buildTestScoringConfig(form) {
  return {
    auto_distribute_scores: Boolean(form.auto_distribute_scores),
  }
}

export function buildTestStep1Payload(form) {
  return {
    create: buildCreateTestPayload(form),
    scoring_config: buildTestScoringConfig(form),
  }
}

/** PATCH /tests/{id} — subject_id is set only at creation (POST /tests). */
export function buildUpdateTestInfoPayload(form) {
  return {
    ...buildTestCoreFields(form),
    scoring_config: buildTestScoringConfig(form),
  }
}

export function buildUpdateTestInfoPayloadFromStep1({ create, scoring_config }) {
  const { subject_id, auto_distribute_scores, ...fields } = create
  return {
    ...fields,
    scoring_config,
  }
}
