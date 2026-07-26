import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookMarked, ChevronLeft, FolderKanban, Network } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { formatStatValue } from '../../lib/subjectDisplay'
import { formatBankUpdatedLabel } from '../../lib/workspaceDashboardModel'
import { shellBodyTextClass, shellCardClass, shellSectionTitleClass, shellSubtleTextClass } from '../../lib/shellUi'

const BANK_ICONS = [Network, FolderKanban, BookMarked]

function WorkspaceDashboardQuestionBanks({ banks, loading }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className={shellCardClass}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-4">
        <h2 className={shellSectionTitleClass}>{t('banks.title')}</h2>
        <Link
          to={ROUTES.QUESTION_BANKS}
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--shell-accent)]"
        >
          {t('banks.viewAll')}
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shell-skeleton h-36 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : banks.length === 0 ? (
        <p className={`px-5 py-10 text-center text-sm ${shellBodyTextClass}`}>{t('banks.empty')}</p>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {banks.map((bank, index) => {
            const Icon = BANK_ICONS[index % BANK_ICONS.length]
            return (
              <Link
                key={bank.bank_id}
                to={`${ROUTES.QUESTION_BANKS}/${bank.bank_id}/editor`}
                className="overflow-hidden rounded-2xl bg-[var(--shell-surface)] ring-1 ring-[var(--shell-border)] transition hover:ring-[var(--shell-accent)]/30"
              >
                <div className="h-1.5 bg-[var(--shell-accent)]" />
                <div className="p-4 text-right">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-3 truncate text-sm font-extrabold text-[var(--shell-text)]">{bank.title}</p>
                  <p className={`mt-2 text-xs ${shellSubtleTextClass}`}>
                    {t('banks.questionsCount', { count: formatStatValue(bank.question_count ?? 0) })}
                  </p>
                  <p className={`mt-1 text-xs ${shellSubtleTextClass}`}>
                    {t('banks.updated', { value: formatBankUpdatedLabel(bank.updated_at) })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default WorkspaceDashboardQuestionBanks
