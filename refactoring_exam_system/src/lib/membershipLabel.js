export function getMembershipLabel(membership) {
  const name = membership.workspace?.name || 'مساحة تعليمية'

  if (membership.role === 'STUDENT') {
    return `طالب ضمن '${name}'`
  }

  if (membership.workspace?.kind === 'SOLO') {
    return `معلم مستقل '${name}'`
  }

  if (membership.is_owner) {
    return `مالك '${name}'`
  }

  return `${membership.role} - ${name}`
}
