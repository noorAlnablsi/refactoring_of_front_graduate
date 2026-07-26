import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { translateBackendMessage } from '../../i18n/translateBackendMessage'
import {
  shellBodyTextClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellPageTitleClass,
} from '../../lib/shellUi'
import { updateGroup } from '../../services/studentGroups.service'
import { useToastStore } from '../../store/toastStore'

function EditGroupModal({ open, group, onClose, onSuccess }) {
  const { t } = useTranslation('groups')
  const showToast = useToastStore((s) => s.showToast)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !group) return
    setName(group.name || '')
    setDescription(group.description || '')
    setError('')
  }, [open, group])

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('validation.nameRequired'))
      return
    }
    setSaving(true)
    try {
      await updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
      })
      showToast(t('toasts.updated'))
      onSuccess?.()
      onClose?.()
    } catch (err) {
      showToast(translateBackendMessage(err.message) || t('errors.updateFailed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !group) return null

  return (
    <div className={shellModalOverlayClass}>
      <div className={`max-w-lg ${shellModalPanelClass}`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-lg ${shellPageTitleClass}`}>{t('edit.title')}</h2>
          <button type="button" onClick={onClose} className="text-[var(--shell-text-subtle)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--shell-text)]">
              {t('create.nameLabel')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
            />
            {error ? <p className="mt-1 text-xs font-semibold text-red-500">{error}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--shell-text)]">
              {t('create.descriptionLabel')}
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`h-11 w-full px-4 text-sm ${shellInputClass}`}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className={`text-sm font-bold ${shellBodyTextClass}`}>
            {t('create.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[var(--shell-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? t('edit.saving') : t('edit.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditGroupModal
