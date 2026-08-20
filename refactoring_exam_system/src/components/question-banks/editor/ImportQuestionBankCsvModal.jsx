import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react'
import { parseApiError } from '../../../lib/apiError'
import { formatLocaleNumber } from '../../../lib/localeNumber'
import {
  customModalOverlayMutedClass,
  customModalPanelSafeClass,
} from '../../../lib/shellUi'
import {
  downloadQuestionBankCsvTemplate,
  importQuestionBankQuestionsFromCsv,
} from '../../../services/questionBanks.service'
import { showAppToast } from '../../../lib/appToast'
import { useToastStore } from '../../../store/toastStore'

function ImportQuestionBankCsvModal({ open, bankId, topics = [], onClose, onSuccess }) {
  const { t, i18n } = useTranslation(['questionBanks', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [importedCount, setImportedCount] = useState(null)

  useEffect(() => {
    if (!open) return
    setFile(null)
    setLoading(false)
    setDownloadingTemplate(false)
    setImportedCount(null)
  }, [open])

  if (!open) return null

  const handleDownloadTemplate = async () => {
    if (!bankId) return
    setDownloadingTemplate(true)
    try {
      await downloadQuestionBankCsvTemplate(bankId)
      showAppToast('editor.csv.templateDownloaded', 'success', { ns: 'questionBanks' })
    } catch (err) {
      showToast(parseApiError(err), 'error')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleImport = async () => {
    if (!bankId) return
    if (!file) {
      showAppToast('editor.csv.selectFileError', 'error', { ns: 'questionBanks' })
      return
    }

    setLoading(true)
    try {
      const data = await importQuestionBankQuestionsFromCsv(bankId, file)
      const count = data.count ?? data.questions?.length ?? 0
      setImportedCount(count)
      showAppToast('editor.csv.imported', 'success', { ns: 'questionBanks', count })
      await onSuccess?.(data)
    } catch (err) {
      showToast(parseApiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={customModalOverlayMutedClass}>
      <div
        dir={i18n.dir()}
        className={`w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl ${customModalPanelSafeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-question-bank-csv-title"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="import-question-bank-csv-title" className="text-xl font-extrabold text-[#2AA8A2]">
            {t('editor.csv.title')}
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

        <p className="text-sm leading-7 text-[#64748B]">{t('editor.csv.subtitle')}</p>

        <div className="mt-4 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('editor.csv.atomicHintTitle')}</p>
          <p className="mt-1 text-xs leading-6 text-[#64748B]">{t('editor.csv.atomicHintBody')}</p>
        </div>

        <div className="mt-4 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('editor.csv.topicsHintTitle')}</p>
          <p className="mt-1 text-xs leading-6 text-[#64748B]">{t('editor.csv.topicsHintBody')}</p>
          {topics.length === 0 ? (
            <p className="mt-3 text-xs font-semibold text-amber-700">{t('editor.csv.topicsEmpty')}</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <li
                  key={topic.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#2A3433] ring-1 ring-[#E5E9EB]"
                >
                  <span className="text-[#2AA8A2]">#{formatLocaleNumber(topic.id)}</span>
                  <span>{topic.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('editor.csv.templateTitle')}</p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#2AA8A2] ring-1 ring-[#2AA8A2]/20 transition hover:bg-[#E8F7F6] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloadingTemplate ? t('editor.csv.downloading') : t('editor.csv.downloadTemplate')}
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFB] px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F6] text-[#2AA8A2]">
            <FileSpreadsheet className="h-7 w-7" strokeWidth={2} />
          </span>
          <p className="mt-4 text-sm font-bold text-[#2A3433]">
            {file ? file.name : t('editor.csv.selectFile')}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
          >
            <Upload className="h-4 w-4" />
            {t('editor.csv.chooseFile')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null)
              setImportedCount(null)
            }}
          />
        </div>

        {importedCount != null ? (
          <div className="mt-4 rounded-xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-[#E5E9EB]">
            <p className="text-sm font-bold text-[#2A3433]">{t('editor.csv.summaryTitle')}</p>
            <p className="mt-1 text-xs font-semibold leading-6 text-[#2AA8A2]">
              {t('editor.csv.summaryImported', { count: formatLocaleNumber(importedCount) })}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-[#2AA8A2]">
            {importedCount != null
              ? t('actions.close', { ns: 'common' })
              : t('actions.cancel', { ns: 'common' })}
          </button>
          {importedCount == null ? (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !file}
              className="rounded-xl bg-[#2AA8A2] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? t('editor.csv.importing') : t('editor.csv.import')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ImportQuestionBankCsvModal
