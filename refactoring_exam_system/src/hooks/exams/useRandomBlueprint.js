import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildRandomFromBanksPayload,
  getActiveBlueprintTopics,
  getBlueprintTotalQuestions,
  validateBlueprintHealth,
} from '../../lib/examBlueprint'
import { addRandomQuestionsFromBanks } from '../../services/tests.service'
import { showAppToast, tUI } from '../../lib/appToast'
import { useToastStore } from '../../store/toastStore'
import { loadBlueprintsForBanks } from '../../components/exams/blueprint/blueprintBankTopics'

export function useRandomBlueprint({ banks, initialBlueprints, testId, onSuccess }) {
  const showToast = useToastStore((s) => s.showToast)
  const [blueprints, setBlueprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const syncBlueprints = async () => {
      setLoading(true)
      try {
        const loaded = await loadBlueprintsForBanks(banks)

        if (cancelled) return

        setBlueprints((prev) => {
          const previousById = new Map(prev.map((item) => [item.bank_id, item]))
          const restoredById = new Map((initialBlueprints || []).map((item) => [item.bank_id, item]))
          return loaded.map(
            (item) => restoredById.get(item.bank_id) ?? previousById.get(item.bank_id) ?? item,
          )
        })
      } catch (err) {
        if (!cancelled) showToast(err.message || tUI('blueprint.errors.loadBankTopics', { ns: 'exams' }), 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    syncBlueprints()

    return () => {
      cancelled = true
    }
  }, [banks, initialBlueprints, showToast])

  const health = useMemo(() => validateBlueprintHealth(blueprints), [blueprints])
  const blueprintQuestionsCount = useMemo(
    () => getBlueprintTotalQuestions(blueprints),
    [blueprints],
  )

  const updateBank = useCallback((bankId, patch) => {
    setBlueprints((prev) =>
      prev.map((item) => (item.bank_id === bankId ? { ...item, ...patch } : item)),
    )
  }, [])

  const updateTopic = useCallback((bankId, topicId, patch) => {
    setBlueprints((prev) =>
      prev.map((bank) => {
        if (bank.bank_id !== bankId) return bank
        return {
          ...bank,
          topics: bank.topics.map((topic) =>
            topic.topic_id === topicId ? { ...topic, ...patch } : topic,
          ),
        }
      }),
    )
  }, [])

  const updateTopicDifficulty = useCallback((bankId, topicId, key, value) => {
    setBlueprints((prev) =>
      prev.map((bank) => {
        if (bank.bank_id !== bankId) return bank
        return {
          ...bank,
          topics: bank.topics.map((topic) => {
            if (topic.topic_id !== topicId) return topic
            return {
              ...topic,
              difficulty: { ...topic.difficulty, [key]: value },
            }
          }),
        }
      }),
    )
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!health.isValid) {
      showAppToast('blueprint.validation.completeDistribution', 'error', { ns: 'exams' })
      return
    }

    const banksWithoutActiveTopics = blueprints.filter(
      (bank) => getActiveBlueprintTopics(bank.topics).length === 0,
    )
    if (banksWithoutActiveTopics.length > 0) {
      showAppToast('blueprint.validation.selectTopicPerBank', 'error', { ns: 'exams' })
      return
    }

    setSubmitting(true)
    try {
      const payload = buildRandomFromBanksPayload(blueprints)
      const result = await addRandomQuestionsFromBanks(testId, payload)
      const added = result?.count ?? health.totalQuestions
      showAppToast('blueprint.toast.generated', 'success', { ns: 'exams', count: added })
      onSuccess?.(result?.questions || [])
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }, [blueprints, health.isValid, health.totalQuestions, onSuccess, showToast, testId])

  return {
    blueprints,
    loading,
    submitting,
    health,
    blueprintQuestionsCount,
    updateBank,
    updateTopic,
    updateTopicDifficulty,
    handleGenerate,
  }
}
