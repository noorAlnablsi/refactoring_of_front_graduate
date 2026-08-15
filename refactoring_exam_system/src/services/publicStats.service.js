import api from '../lib/axios'

/**
 * GET /api/public/platform-stats — no JWT / no workspace header.
 * { users_count, students_count }
 */
export async function getPlatformStats() {
  const { data } = await api.get('/api/public/platform-stats')
  return {
    usersCount: Number(data?.users_count) || 0,
    studentsCount: Number(data?.students_count) || 0,
  }
}
