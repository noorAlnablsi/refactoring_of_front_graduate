import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Headset } from 'lucide-react'
import CreateReportModal from '../../settings/CreateReportModal'

function StudentSupportSettingsCard() {
  const { t } = useTranslation('settings')
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="rounded-2xl bg-[var(--shell-surface)] p-6 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] md:p-7">
        <header className="mb-2 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
            <Headset className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-[var(--shell-text)]">{t('report.cardTitle')}</h2>
            <p className="mt-1 text-sm leading-7 text-[var(--shell-text-muted)]">
              {t('report.cardSubtitle')}
            </p>
          </div>
        </header>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 flex w-full flex-col gap-1 border-t border-[var(--shell-border)] py-4 text-start transition hover:bg-[var(--shell-hover)]"
        >
          <span className="text-sm font-extrabold text-[var(--shell-text)]">{t('report.contactTitle')}</span>
          <span className="text-xs leading-6 text-[var(--shell-text-subtle)]">{t('report.contactHint')}</span>
        </button>
      </section>

      <CreateReportModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default StudentSupportSettingsCard
