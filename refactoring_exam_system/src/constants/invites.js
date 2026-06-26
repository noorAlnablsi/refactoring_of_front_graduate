export const INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
}

export const INVITE_ASSIGNABLE_ROLES = [
  { value: 'STUDENT', label: 'طالب' },
  { value: 'TEACHER', label: 'معلم' },
  { value: 'ADMIN', label: 'مدير' },
]

export const INVITE_STATUS_MESSAGES = {
  [INVITE_STATUS.PENDING]: null,
  [INVITE_STATUS.ACCEPTED]: 'تم قبول هذه الدعوة مسبقاً.',
  [INVITE_STATUS.REJECTED]: 'تم رفض هذه الدعوة.',
  [INVITE_STATUS.EXPIRED]: 'انتهت صلاحية هذه الدعوة.',
}
