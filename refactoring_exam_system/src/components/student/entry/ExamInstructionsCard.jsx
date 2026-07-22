import { useTranslation } from 'react-i18next'

function ExamInstructionsCard({ instructions = [], agreed, onAgreedChange }) {
  const { t } = useTranslation('student')

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <h2 className="mb-4 text-base font-extrabold text-[#2A3433]">{t('entry.instructionsTitle')}</h2>

      {instructions.length ? (
        <ul className="space-y-2.5">
          {instructions.map((item, index) => (
            <li key={`${index}-${item.slice(0, 24)}`} className="flex gap-2.5 text-start text-sm leading-6 text-[#475569]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2AA8A2]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#94A3B8]">{t('entry.instructionsEmpty')}</p>
      )}

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#F6F8F9] px-3 py-3 text-start">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onAgreedChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2AA8A2] focus:ring-[#2AA8A2]"
        />
        <span className="text-sm font-semibold leading-6 text-[#2A3433]">{t('entry.consent')}</span>
      </label>
    </section>
  )
}

export default ExamInstructionsCard
