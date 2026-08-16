import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react'
import { formatLocaleNumber } from '../../lib/localeNumber'
import { getBulkImportAllowedRoles } from '../../lib/workspaceContext'
import {
  customModalOverlayMutedClass,
  customModalPanelSafeClass,
} from '../../lib/shellUi'
import {
  downloadWorkspaceMembersCsvTemplate,
  importWorkspaceMembersCsv,
} from '../../services/workspaces.service'
import { useToastStore } from '../../store/toastStore'

function ImportMembersCsvModal({ open, onClose, onSuccess }) {
  const { t } = useTranslation(['members', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [result, setResult] = useState(null)
  const allowedRoles = getBulkImportAllowedRoles()

  useEffect(() => {
    if (!open) return
    setFile(null)
    setResult(null)
    setLoading(false)
    setDownloadingTemplate(false)
  }, [open])

  if (!open) return null

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      await downloadWorkspaceMembersCsvTemplate()
      showToast(t('csv.templateDownloaded'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleImport = async () => {
    if (!file) {
      showToast(t('csv.selectFileError'), 'error')
      return
    }

    setLoading(true)
    try {
      const data = await importWorkspaceMembersCsv(file)
      setResult(data)
      const failed = data.failed_count ?? data.failed_rows?.length ?? 0
      if (failed > 0) {
        showToast(t('csv.importedWithFailures', { failed: formatLocaleNumber(failed) }), 'error')
      } else {
        showToast(t('csv.imported'), 'success')
      }
      onSuccess?.(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={customModalOverlayMutedClass}>
      <div
        dir="rtl"
        className={`w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl ${customModalPanelSafeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-members-csv-title"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="import-members-csv-title" className="text-xl font-extrabold text-[#2AA8A2]">
            {t('csv.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8]"
            aria-label={t('actions.close', { ns: 'common' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-7 text-[#64748B]">{t('csv.subtitle')}</p>

        <div className="mt-4 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('csv.rolesTitle')}</p>
          <p className="mt-1 text-xs leading-6 text-[#64748B]">
            {t('csv.rolesHint', { roles: allowedRoles.join(' · ') })}
          </p>
          <p className="mt-2 text-xs leading-6 text-[#64748B]">{t('csv.columnsHint')}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('csv.templateTitle')}</p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#2AA8A2] ring-1 ring-[#2AA8A2]/20 transition hover:bg-[#E8F7F6] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloadingTemplate ? t('csv.downloading') : t('csv.downloadTemplate')}
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFB] px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F6] text-[#2AA8A2]">
            <FileSpreadsheet className="h-7 w-7" strokeWidth={2} />
          </span>
          <p className="mt-4 text-sm font-bold text-[#2A3433]">
            {file ? file.name : t('csv.selectFile')}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
          >
            <Upload className="h-4 w-4" />
            {t('csv.chooseFile')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null)
              setResult(null)
            }}
          />
        </div>

        {result ? (
          <div className="mt-4 space-y-3 rounded-xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-[#E5E9EB]">
            <p className="text-sm font-bold text-[#2A3433]">{t('csv.summaryTitle')}</p>
            <ul className="grid gap-1 text-xs font-semibold text-[#64748B] sm:grid-cols-2">
              <li>{t('csv.summary.total', { count: formatLocaleNumber(result.total_rows ?? 0) })}</li>
              <li>
                {t('csv.summary.createdMemberships', {
                  count: formatLocaleNumber(result.created_memberships ?? 0),
                })}
              </li>
              <li>
                {t('csv.summary.createdUsers', {
                  count: formatLocaleNumber(result.created_users ?? 0),
                })}
              </li>
              <li>
                {t('csv.summary.linkedExisting', {
                  count: formatLocaleNumber(result.existing_users_linked ?? 0),
                })}
              </li>
              <li>
                {t('csv.summary.alreadyMembers', {
                  count: formatLocaleNumber(result.already_members ?? 0),
                })}
              </li>
              <li>
                {t('csv.summary.emailsQueued', {
                  count: formatLocaleNumber(result.emails_queued ?? 0),
                })}
              </li>
              <li>
                {t('csv.summary.failed', {
                  count: formatLocaleNumber(result.failed_count ?? 0),
                })}
              </li>
            </ul>

            {Array.isArray(result.failed_rows) && result.failed_rows.length > 0 ? (
              <div className="max-h-40 overflow-y-auto rounded-lg bg-white p-3 ring-1 ring-red-100">
                <p className="mb-2 text-xs font-bold text-red-700">{t('csv.failedRowsTitle')}</p>
                <ul className="space-y-2 text-xs text-red-600">
                  {result.failed_rows.map((row, index) => (
                    <li key={`${row.row}-${row.email || index}`}>
                      {t('csv.failedRow', {
                        row: formatLocaleNumber(row.row),
                        email: row.email || '—',
                        error: row.error || '',
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {result ? t('actions.close', { ns: 'common' }) : t('actions.cancel', { ns: 'common' })}
          </button>
          {!result ? (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !file}
              className="rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? t('csv.importing') : t('csv.import')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ImportMembersCsvModal
