import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import { normalizeStudentGroup } from '../../lib/studentGroupsModel'
import { getGroupDetails } from '../../services/studentGroups.service'

export function useGroupDetails(groupId) {
  const { t } = useTranslation('groups')
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchGroup = useCallback(async () => {
    if (!groupId) return
    setLoading(true)
    setError('')
    try {
      const data = await getGroupDetails(groupId)
      setGroup(normalizeStudentGroup(data))
    } catch (err) {
      setGroup(null)
      setError(translateBackendMessage(err.message) || t('errors.loadDetailsFailed'))
    } finally {
      setLoading(false)
    }
  }, [groupId, t])

  useEffect(() => {
    fetchGroup()
  }, [fetchGroup])

  return { group, loading, error, refetch: fetchGroup, setGroup }
}
