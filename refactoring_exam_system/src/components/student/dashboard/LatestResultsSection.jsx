import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'

const STATUS_STYLES = {
  approved: 'bg-[#E8F7F6] text-[#2AA8A2]',
  pending: 'bg-[#FFF7ED] text-[#EA580C]',
}

function LatestResultsSection({ results }) {
  const { t } = useTranslation(['student', 'forms'])

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-[#2A3433]">{t('latestResults.title')}</h2>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-[#F6F8F9] hover:text-[#64748B]"
          aria-label={t('aria.filterResults', { ns: 'forms' })}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-right text-sm">
          <thead>
            <tr className="border-b border-[#EEF2F4] text-xs font-semibold text-[#94A3B8]">
              <th className="px-3 py-3 font-semibold">{t('latestResults.columns.exam')}</th>
              <th className="px-3 py-3 font-semibold">{t('latestResults.columns.subject')}</th>
              <th className="px-3 py-3 font-semibold">{t('latestResults.columns.score')}</th>
              <th className="px-3 py-3 font-semibold">{t('latestResults.columns.date')}</th>
              <th className="px-3 py-3 font-semibold">{t('latestResults.columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {results.length ? (
              results.map((row) => (
                <tr key={row.id} className="border-b border-[#F6F8F9] last:border-0">
                  <td className="px-3 py-4 font-bold text-[#2A3433]">{row.exam}</td>
                  <td className="px-3 py-4 text-[#64748B]">{row.subject}</td>
                  <td className="px-3 py-4">
                    <span className="font-extrabold text-[#2AA8A2]">{row.score}</span>
                    {row.scoreDetail ? (
                      <span className="mr-1 text-xs text-[#94A3B8]">({row.scoreDetail})</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-4 text-[#64748B]">{row.date}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[row.status]}`}
                    >
                      {t(`latestResults.status.${row.status}`)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-[#94A3B8]">
                  {t('latestResults.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default LatestResultsSection
