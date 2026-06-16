import { getTeacherAvatarUrl, getTeacherName } from '../../../lib/subjectDisplay'

function TeacherAvatar({ teacher, size = 'md' }) {
  const avatarUrl = getTeacherAvatarUrl(teacher)
  const name = getTeacherName(teacher)
  const sizes = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    )
  }

  return (
    <span
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-[#E8F7F6] font-bold text-[#2AA8A2] ring-2 ring-white`}
    >
      {name.charAt(0)}
    </span>
  )
}

export default TeacherAvatar
