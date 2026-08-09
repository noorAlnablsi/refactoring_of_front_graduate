import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatAnalyticsCount,
  formatAnalyticsDate,
  formatAnalyticsPercent,
} from '../../lib/institutionAnalyticsModel'
import { isIntegrityReportPending } from '../../lib/integrityReportsModel'
import {
  shellAccentButtonClass,
  shellBodyTextClass,
  shellGhostButtonClass,
  shellInputClass,
  shellModalOverlayClass,
  shellModalPanelClass,
  shellSectionTitleClass,
} from '../../lib/shellUi'

function IntegrityReportReviewModal({
  open,
  report,
  submitting = false,
  onClose,
  onConfirm,
  onDismiss,
}) {
  const { t } = useTranslation(['analytics', 'common'])
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) setNote(report?.review_note || '')
  }, [open, report])

  if (!open || !report) return null

  const pending = isIntegrityReportPending(report)

  return (
    <div className={shellModalOverlayClass} role="dialog" aria-modal="true">
      <div className={`max-w-lg ${shellModalPanelClass}`}>
        <h2 className={shellSectionTitleClass}>{t('integrity.reviewTitle')}</h2>
        <p className={`mt-2 ${shellBodyTextClass}`}>
          {report.student_name} · {report.test_name}
        </p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.detail.risk')}
            </dt>
            <dd className="mt-1 font-extrabold text-rose-600">
              {formatAnalyticsPercent(report.risk_percentage)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.detail.violations')}
            </dt>
            <dd className="mt-1 font-bold text-[var(--shell-text)]">
              {formatAnalyticsCount(report.violations_count)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.detail.score')}
            </dt>
            <dd className="mt-1 font-bold text-[var(--shell-text)]">
              {formatAnalyticsPercent(report.percentage)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.status')}
            </dt>
            <dd className="mt-1 font-bold text-[var(--shell-text)]">
              {t(`integrity.statuses.${report.status}`, { defaultValue: report.status })}
            </dd>
          </div>
          {report.termination_reason ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
                {t('integrity.detail.termination')}
              </dt>
              <dd className={`mt-1 ${shellBodyTextClass}`}>{report.termination_reason}</dd>
            </div>
          ) : null}
          {report.recommendation_reason ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
                {t('integrity.detail.reason')}
              </dt>
              <dd className={`mt-1 ${shellBodyTextClass}`}>{report.recommendation_reason}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.createdAt')}
            </dt>
            <dd className={`mt-1 ${shellBodyTextClass}`}>
              {formatAnalyticsDate(report.created_at || report.submitted_at)}
            </dd>
          </div>
        </dl>

        {pending ? (
          <label className="mt-5 block">
            <span className="text-xs font-bold text-[var(--shell-text-muted)]">
              {t('integrity.reviewNote')}
            </span>
            <textarea
              className={`mt-2 min-h-[96px] w-full ${shellInputClass} p-3 text-sm`}
              value={note}
              placeholder={t('integrity.reviewNotePlaceholder')}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
            />
          </label>
        ) : (
          <p className="mt-5 rounded-xl bg-[var(--shell-hover)] px-3 py-2 text-sm font-semibold text-[var(--shell-text-muted)]">
            {t('integrity.alreadyReviewed')}
            {report.review_note ? ` — ${report.review_note}` : ''}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className={shellGhostButtonClass} onClick={onClose} disabled={submitting}>
            {t('common:actions.close', { defaultValue: t('common:cancel') })}
          </button>
          {pending ? (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                disabled={submitting}
                onClick={() => onDismiss?.(note)}
              >
                {t('integrity.submitDismiss')}
              </button>
              <button
                type="button"
                className={shellAccentButtonClass}
                disabled={submitting}
                onClick={() => onConfirm?.(note)}
              >
                {t('integrity.submitConfirm')}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default IntegrityReportReviewModal
