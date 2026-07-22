import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function StartExamButton({ disabled, onClick, isResume, loading = false }) {
  const { t } = useTranslation('student')

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2AA8A2] px-5 py-4 text-base font-extrabold text-white shadow-[0_12px_24px_rgba(42,168,162,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>
          {loading
            ? t('entry.starting')
            : isResume
              ? t('entry.resumeExam')
              : t('entry.startExam')}
        </span>
        {!loading ? <ArrowLeft className="h-5 w-5" /> : null}
      </button>
      <p className="text-center text-xs leading-5 text-[#94A3B8]">{t('entry.startHint')}</p>
    </div>
  )
}

export default StartExamButton
