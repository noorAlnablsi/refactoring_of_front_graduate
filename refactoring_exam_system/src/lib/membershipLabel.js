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

  if (membership.role === 'TEACHER') {
    return `معلم ضمن مؤسسة '${name}'`
  }

  if (membership.role === 'ADMIN') {
    return `مدير ضمن مؤسسة '${name}'`
  }

  return `${membership.role} - ${name}`
}
