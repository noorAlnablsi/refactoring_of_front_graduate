/**
 * Normalize memberships from GET /users/{id}/memberships
 * and preserve local extras (e.g. logo_url) when the list payload is slim.
 */
export function normalizeUserMemberships(rawMemberships = [], previousMemberships = []) {
  const previousById = new Map(
    previousMemberships.map((item) => [Number(item.membership_id), item]),
  )

  return (rawMemberships || []).map((item) => {
    const previous = previousById.get(Number(item.membership_id))
    const workspace = item.workspace || {}

    return {
      membership_id: item.membership_id,
      role: item.role,
      is_owner: Boolean(item.is_owner),
      status: item.status || previous?.status || 'ACTIVE',
      subject_role: item.subject_role ?? previous?.subject_role ?? null,
      created_at: item.created_at || previous?.created_at || null,
      joined_at: item.joined_at || previous?.joined_at || null,
      workspace: {
        id: workspace.id,
        kind: workspace.kind || previous?.workspace?.kind || null,
        name: workspace.name || previous?.workspace?.name || '',
        logo_url: workspace.logo_url ?? previous?.workspace?.logo_url ?? null,
        description: workspace.description ?? previous?.workspace?.description ?? null,
      },
    }
  })
}
