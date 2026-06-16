export const WORKSPACE_KIND = {
  INSTITUTION: 'INSTITUTION',
  SOLO: 'SOLO',
}

export const REGISTRATION_FLOW = {
  INSTITUTION: 'institution',
  STUDENT: 'student',
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
  message: 'كلمة المرور يجب ألا تقل عن 8 أحرف',
}
