import i18n from '../i18n'

function tRole(key, values = {}) {
  return i18n.t(`roles.${key}`, { ns: 'common', ...values })
}

export function getMembershipRoleLabel(membership) {
  if (!membership) return ''

  if (membership.role === 'STUDENT') return tRole('student')
  if (membership.is_owner) return tRole('owner')
  if (membership.role === 'TEACHER') return tRole('teacher')
  if (membership.role === 'ADMIN') return tRole('admin')

  return membership.role
}

export function getMembershipShortLabel(membership) {
  if (!membership) return ''

  if (membership.role === 'STUDENT') return tRole('student')
  if (membership.workspace?.kind === 'SOLO') return tRole('soloTeacher')
  if (membership.is_owner) return tRole('institutionOwner')
  if (membership.role === 'TEACHER') return tRole('institutionTeacher')
  if (membership.role === 'ADMIN') return tRole('admin')

  return membership.role
}

export function getMembershipLabel(membership) {
  const name = membership.workspace?.name || tRole('defaultWorkspace')

  if (membership.role === 'STUDENT') {
    return tRole('studentInWorkspace', { name })
  }

  if (membership.workspace?.kind === 'SOLO') {
    return tRole('soloTeacherNamed', { name })
  }

  if (membership.is_owner) {
    return tRole('ownerNamed', { name })
  }

  if (membership.role === 'TEACHER') {
    return tRole('institutionTeacherNamed', { name })
  }

  if (membership.role === 'ADMIN') {
    return tRole('adminNamed', { name })
  }

  return `${membership.role} - ${name}`
}
