export function getInviteRole(preview) {
  return preview?.assigned_role || preview?.role || ''
}

export function getInviteWorkspaceName(preview) {
  return preview?.workspace?.name || preview?.workspace_name || ''
}

export function isInviteActionable(preview) {
  const status = preview?.status
  return !status || status === 'PENDING'
}
