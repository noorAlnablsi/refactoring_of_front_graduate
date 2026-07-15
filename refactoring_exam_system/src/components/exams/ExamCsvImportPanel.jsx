import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Download, FileSpreadsheet, Upload } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import { showAppToast } from '../../lib/appToast'
import {
  downloadExamQuestionsCsvTemplate,
  importQuestionsFromCsv,
} from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'

function ExamCsvImportPanel({ testId, onBack, onSuccess, onSaveDraft, savingDraft = false }) {
  const { t } = useTranslation(['exams', 'common'])
  const showToast = useToastStore((s) => s.showToast)
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      await downloadExamQuestionsCsvTemplate()
      showAppToast('wizard.csv.templateDownloaded', 'success', { ns: 'exams' })
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleImport = async () => {
    if (!file) {
      showAppToast('wizard.csv.selectCsvError', 'error', { ns: 'exams' })
      return
    }

    setLoading(true)
    try {
      const data = await importQuestionsFromCsv(testId, file)
      const count = data.count ?? data.questions?.length ?? 0
      const failed = data.failed_count ?? data.failed_rows?.length ?? 0

      if (failed > 0) {
        showAppToast('wizard.csv.importedWithFailures', 'error', { ns: 'exams', count, failed })
      } else {
        showAppToast('wizard.csv.imported', 'success', { ns: 'exams', count })
      }

      await onSuccess?.(data.questions || [])
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">{t('wizard.csv.eyebrow')}</p>
        <h2 className="mt-2 text-[28px] font-extrabold text-[#2A3433]">{t('wizard.csv.title')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">{t('wizard.csv.subtitle')}</p>
      </header>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8FDFC] px-4 py-3 ring-1 ring-[#CFECE9]">
          <p className="text-sm font-semibold text-[#2A3433]">{t('wizard.csv.templateTitle')}</p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#2AA8A2] ring-1 ring-[#2AA8A2]/20 transition hover:bg-[#E8F7F6] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloadingTemplate ? t('wizard.csv.downloading') : t('wizard.csv.downloadTemplate')}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFB] px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F6] text-[#2AA8A2]">
            <FileSpreadsheet className="h-7 w-7" strokeWidth={2} />
          </span>
          <p className="mt-4 text-sm font-bold text-[#2A3433]">
            {file ? file.name : t('wizard.csv.selectFile')}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
          >
            <Upload className="h-4 w-4" />
            {t('wizard.csv.chooseFile')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </div>
      </div>

      <ExamWizardFooter className="-mx-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            {t('wizard.questions.review.back')}
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft || !onSaveDraft}
            className="text-sm font-bold text-[#64748B] disabled:opacity-50"
          >
            {savingDraft ? t('wizard.basicInfo.savingDraft') : t('wizard.basicInfo.saveDraft')}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !file}
            className="rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? t('wizard.csv.importing') : t('wizard.csv.importQuestions')}
          </button>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamCsvImportPanel
