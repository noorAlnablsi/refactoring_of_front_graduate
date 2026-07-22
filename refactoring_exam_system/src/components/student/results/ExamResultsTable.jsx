import { useTranslation } from 'react-i18next'
import { BookOpen, Download, SlidersHorizontal } from 'lucide-react'
import SubjectsPagination from '../../subjects/SubjectsPagination'
import { formatBankCardDate } from '../../../lib/questionBanks'
import { getPercentageBarTone, getResultDisplayDate } from '../../../lib/studentResultsModel'

const TONE_BAR = {
  success: 'bg-[var(--shell-accent)]',
  info: 'bg-[var(--shell-info-text)]',
  danger: 'bg-[var(--shell-danger-text)]',
  muted: 'bg-[var(--shell-border)]',
}

const TH =
  'px-4 py-3 text-start text-xs font-semibold text-[var(--shell-text-subtle)] align-middle whitespace-nowrap'
const TD = 'px-4 py-3.5 text-start align-middle'

function TeacherCell({ name }) {
  const initial = String(name || '—')
    .trim()
    .charAt(0)
    .toUpperCase()

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--shell-accent-bg)] text-xs font-extrabold text-[var(--shell-accent)]"
        aria-hidden="true"
      >
        {initial || '—'}
      </span>
      <span className="truncate text-sm font-semibold text-[var(--shell-text)]">{name}</span>
    </div>
  )
}

function PercentageCell({ percentage }) {
  if (percentage == null) {
    return <span className="text-sm font-semibold text-[var(--shell-text-subtle)]">—</span>
  }

  const tone = getPercentageBarTone(percentage)
  const width = Math.min(100, Math.max(0, Number(percentage)))
  const label = `${Number.isInteger(percentage) ? percentage : Number(percentage).toFixed(1)}%`

  return (
    <div className="flex w-full max-w-[160px] items-center gap-2.5">
      <span className="w-11 shrink-0 text-start text-sm font-extrabold tabular-nums text-[var(--shell-text)]">
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--shell-input-bg)]">
        <div
          className={`h-full rounded-full ${TONE_BAR[tone]}`}
          style={{ width: `${width}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

function ExamResultsTable({
  rows,
  loading,
  total,
  page,
  perPage,
  totalPages,
  onPageChange,
  onSort,
  onExport,
  sortBy,
}) {
  const { t } = useTranslation('student')
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <section className="rounded-2xl bg-[var(--shell-surface)] p-5 shadow-[var(--shell-shadow-sm)] ring-1 ring-[var(--shell-border)] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-[var(--shell-text)]">
          {t('performance.table.title')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSort}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-3.5 py-2 text-xs font-bold text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {t('performance.table.sort')}
            <span className="text-[var(--shell-text-subtle)]">
              ({t(`performance.table.sortBy.${sortBy}`)})
            </span>
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--shell-input-bg)] px-3.5 py-2 text-xs font-bold text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-hover)]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t('performance.table.export')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--shell-border)]">
              <th className={TH}>{t('performance.table.columns.exam')}</th>
              <th className={TH}>{t('performance.table.columns.subject')}</th>
              <th className={TH}>{t('performance.table.columns.teacher')}</th>
              <th className={TH}>{t('performance.table.columns.score')}</th>
              <th className={TH}>{t('performance.table.columns.percentage')}</th>
              <th className={TH}>{t('performance.table.columns.gradedAt')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`sk-${index}`} className="border-b border-[var(--shell-border)]/50">
                  <td colSpan={6} className={TD}>
                    <div className="shell-skeleton h-8 animate-pulse rounded-lg" />
                  </td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <tr
                  key={row.attemptId}
                  className="border-b border-[var(--shell-border)]/50 last:border-0"
                >
                  <td className={TD}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate font-bold text-[var(--shell-text)]">{row.title}</span>
                    </div>
                  </td>
                  <td className={`${TD} text-[var(--shell-text-muted)]`}>
                    <span className="line-clamp-2">{row.subject}</span>
                  </td>
                  <td className={TD}>
                    <TeacherCell name={row.teacherName} />
                  </td>
                  <td className={`${TD} font-extrabold tabular-nums text-[var(--shell-text)]`}>
                    {row.score == null || row.maxScore == null
                      ? '—'
                      : t('performance.table.scoreValue', {
                          earned: row.score,
                          maximum: row.maxScore,
                        })}
                  </td>
                  <td className={TD}>
                    <PercentageCell percentage={row.percentage} />
                  </td>
                  <td className={`${TD} whitespace-nowrap text-[var(--shell-text-muted)]`}>
                    {formatBankCardDate(getResultDisplayDate(row))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[var(--shell-text-subtle)]"
                >
                  {t('performance.table.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--shell-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--shell-text-subtle)]">
          {t('performance.table.showing', { from, to, total })}
        </p>
        <SubjectsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </section>
  )
}

export default ExamResultsTable
