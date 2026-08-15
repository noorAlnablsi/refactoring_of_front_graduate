function buildTestCoreFields(form, { includeTotalScore = true } = {}) {
  const payload = {
    name: form.name.trim(),
    duration_minutes: Number(form.duration_minutes) || 60,
    passing_score: Number(form.passing_score) || 60,
  }

  if (includeTotalScore) {
    payload.total_score = Number(form.total_score) || 100
  }

  const description = form.description?.trim()
  if (description) {
    payload.description = description
  }

  return payload
}

/** POST /tests — backend accepts top-level auto_distribute_scores only at create. */
export function buildCreateTestPayload(form) {
  const autoDistribute = Boolean(form.auto_distribute_scores)
  const payload = {
    ...buildTestCoreFields(form, { includeTotalScore: autoDistribute }),
    auto_distribute_scores: autoDistribute,
  }

  // Backend requires subject_id for create (institution and SOLO).
  const subjectId = Number(form.subject_id)
  if (Number.isFinite(subjectId) && subjectId > 0) {
    payload.subject_id = subjectId
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
 * When auto_distribute is disabled, total_score must not be sent (derived from question points).
 */
export function buildUpdateTestInfoPayload(form) {
  return buildTestCoreFields(form, {
    includeTotalScore: Boolean(form.auto_distribute_scores),
  })
}

export function buildUpdateTestInfoPayloadFromStep1({ create }, options = {}) {
  const fields = { ...(create || {}) }
  const autoDistribute =
    options.autoDistribute != null
      ? Boolean(options.autoDistribute)
      : Boolean(fields.auto_distribute_scores)
  delete fields.subject_id
  delete fields.auto_distribute_scores
  delete fields.scoring_config

  const payload = {
    name: fields.name,
    description: fields.description,
    duration_minutes: fields.duration_minutes,
    passing_score: fields.passing_score,
  }

  if (autoDistribute) {
    payload.total_score = fields.total_score
  }

  return payload
}
