export function normalizeWorkspace(payload) {
  const workspace = payload?.workspace || payload?.data || payload || {}

  return {
    id: workspace.id ?? null,
    name: workspace.name?.trim() || '',
    slug: workspace.slug?.trim() || '',
    kind: workspace.kind || null,
    description: workspace.description?.trim() || '',
    logo_url: workspace.logo_url || null,
    institution_type: workspace.institution_type?.trim() || workspace.type?.trim() || '',
  }
}

export function getInstitutionTypeLabel(workspace) {
  if (workspace?.institution_type?.trim()) {
    return workspace.institution_type.trim()
  }

  if (workspace?.type?.trim()) {
    return workspace.type.trim()
  }

  if (workspace?.kind === 'INSTITUTION') {
    return 'أكاديمية'
  }

  return '—'
}
