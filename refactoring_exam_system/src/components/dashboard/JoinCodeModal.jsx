import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, KeyRound, X } from 'lucide-react'
import { useAppTranslation } from '../../hooks/useAppTranslation'
import { getActiveMembership } from '../../lib/workspaceContext'
import { getWorkspaceJoinCode } from '../../services/workspaces.service'
import { customModalOverlayClass, customModalPanelSafeClass } from '../../lib/shellUi'

function JoinCodeModal({ open, onClose }) {
  const { t } = useAppTranslation('navigation')
  const membership = getActiveMembership()
  const workspaceName = membership?.workspace?.name?.trim() || ''
  const workspaceId = membership?.workspace?.id

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchCode = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(false)
    try {
      const joinCode = await getWorkspaceJoinCode(workspaceId)
      setCode(joinCode)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    if (open && !code && !loading && !error) {
      fetchCode()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard API unavailable */
    }
  }

  const handleClose = () => {
    setCode('')
    setError(false)
    setCopied(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className={customModalOverlayClass} onClick={handleClose}>
      <div
        dir="rtl"
        className={`w-full max-w-lg rounded-2xl bg-white shadow-2xl ${customModalPanelSafeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E9EB] px-8 py-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7F6] text-[#2AA8A2]">
              <KeyRound className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-[#2A3433]">
                {t('sidebar.joinCode')}
              </h3>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {t('sidebar.joinCodeTitle', { workspace: workspaceName })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-xl p-2 text-[#94A3B8] transition hover:bg-[#F6F8F9] hover:text-[#64748B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          <p className="mb-6 text-sm leading-6 text-[#64748B]">
            {t('sidebar.joinCodeHint')}
          </p>

          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <p className="text-sm text-[#94A3B8]">{t('sidebar.joinCodeLoading')}</p>
            </div>
          ) : error ? (
            <div className="flex h-20 items-center justify-center">
              <p className="text-sm font-semibold text-red-600">{t('sidebar.joinCodeError')}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F6F8F9] px-6 py-5 ring-1 ring-[#E5E9EB]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                {t('sidebar.joinCodeLabel')}
              </p>
              <div className="flex items-center gap-4">
                <span className="flex-1 font-mono text-[2rem] font-extrabold tracking-[0.2em] text-[#2A3433]">
                  {code || '—'}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!code}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${
                    copied
                      ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                      : 'bg-[#2AA8A2] text-white hover:bg-[#238F8A] shadow-[0_6px_16px_rgba(42,168,162,0.25)]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t('sidebar.joinCodeCopied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t('sidebar.joinCodeCopy')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-start border-t border-[#E5E9EB] px-8 py-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-[#F6F8F9] px-7 py-3 text-sm font-bold text-[#64748B] transition hover:bg-[#E5E9EB]"
          >
            {t('sidebar.joinCodeClose')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinCodeModal
