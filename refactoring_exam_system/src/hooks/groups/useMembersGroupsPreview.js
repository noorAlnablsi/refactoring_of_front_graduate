import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { normalizeStudentGroup } from '../../lib/studentGroupsModel'
import { getWorkspaceGroups } from '../../services/studentGroups.service'

export function useMembersGroupsPreview(limit = 5) {
  const { t } = useTranslation('groups')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getWorkspaceGroups()
      const normalized = (data.groups || [])
        .map(normalizeStudentGroup)
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, limit)
      setGroups(normalized)
    } catch (err) {
      setGroups([])
      setError(translateBackendMessage(err.message) || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [limit, t])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return { groups, loading, error }
}
