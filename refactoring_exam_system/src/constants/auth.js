export const WORKSPACE_KIND = {
  INSTITUTION: 'INSTITUTION',
  SOLO: 'SOLO',
}

/** UI-only mode on create-workspace screen (student joins by code; does not POST /workspaces). */
export const CREATE_WORKSPACE_MODE = {
  INSTITUTION: WORKSPACE_KIND.INSTITUTION,
  SOLO: WORKSPACE_KIND.SOLO,
  STUDENT_JOIN: 'STUDENT_JOIN',
}

export const REGISTRATION_FLOW = {
  INSTITUTION: 'institution',
  STUDENT: 'student',
  INVITE: 'invite',
  EMAIL_VERIFICATION: 'email_verification',
}

export const WELCOME_SELECTION = {
  CREATE_SPACE: 'create_space',
  JOIN_STUDENT: 'join_student',
}

export const OTP_LENGTH = 6
export const OTP_RESEND_COOLDOWN_SEC = 60
export const INSTITUTION_APPROVAL_POLL_INTERVAL_SEC = 5

export const PASSWORD_RULES = {
  minLength: 8,
}
