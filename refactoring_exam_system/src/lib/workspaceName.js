import { WORKSPACE_KIND } from '../constants/auth'

/** SOLO / INSTITUTION → الاسم المُدخل من المستخدم */
export function resolveWorkspaceName({ kind, fullName, workspaceName }) {
  const trimmed = workspaceName?.trim() || ''

  if (kind === WORKSPACE_KIND.SOLO && !trimmed) {
    return fullName?.trim() || ''
  }

  return trimmed
}

export function resolveWorkspaceDescription({ description }) {
  return description?.trim() || ''
}
