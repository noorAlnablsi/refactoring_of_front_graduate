import { useTranslation } from 'react-i18next'

function StudentPlaceholderPage({ page }) {
  const { t } = useTranslation('student')

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <h1 className="text-2xl font-extrabold text-[#2A3433]">{t(`placeholder.${page}.title`)}</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-[#64748B]">
        {t(`placeholder.${page}.description`)}
      </p>
      <p className="mt-4 text-xs font-semibold text-[#94A3B8]">{t('placeholder.comingSoon')}</p>
    </div>
  )
}

export default StudentPlaceholderPage
