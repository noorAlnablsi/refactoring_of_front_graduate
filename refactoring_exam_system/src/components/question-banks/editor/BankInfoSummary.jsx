import { useTranslation } from 'react-i18next'
import VisibilityBadge from '../VisibilityBadge'

function BankInfoSummary({ bank }) {
  const { t } = useTranslation('questionBanks')

  return (
    <section className="min-w-0 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2AA8A2]">{t('page.eyebrow')}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#2A3433] sm:text-4xl">{t('editor.bankInfoTitle')}</h1>
          <p className="mt-2 text-sm text-[#64748B]">{t('page.subtitle')}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="min-w-0 rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">{t('labels.bankName')}</p>
          <p className="mt-1 truncate text-sm font-bold text-[#2A3433]">{bank.title}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">{t('labels.subject')}</p>
          <p className="mt-1 truncate text-sm font-bold text-[#2A3433]">{bank.subject_name || '—'}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-[#F8FAFB] p-3">
          <p className="text-xs text-[#94A3B8]">{t('labels.currentPrivacy')}</p>
          <div className="mt-1">
            <VisibilityBadge value={bank.visibility} />
          </div>
        </div>
      </div>
      {bank.description ? <p className="mt-4 break-words text-sm text-[#64748B]">{bank.description}</p> : null}
    </section>
  )
}

export default BankInfoSummary
