import { useTranslation } from 'react-i18next'
import { Lightbulb, ShieldCheck, Sparkles } from 'lucide-react'
import { getTestQuestionsCount, getTestTotalPoints } from '../../lib/testDisplay'
import { isAiMonitoringActive, normalizeSettingsConfig } from '../../lib/testSettings'
import { getTestName } from '../../lib/testModel'

function ExamSettingsSummarySidebar({ test, settings }) {
  const { t } = useTranslation('exams')
  const questionsCount = getTestQuestionsCount(test)
  const totalScore = test?.total_score ?? getTestTotalPoints(test)
  const monitoringActive = isAiMonitoringActive(normalizeSettingsConfig(settings || {}))

  return (
    <div className="space-y-4">
      <aside className="rounded-2xl bg-white p-5 ring-1 ring-[#E5E9EB]">
        <h3 className="text-sm font-extrabold text-[#2A3433]">{t('wizard.summary.settingsTitle')}</h3>

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-[#94A3B8]">{t('wizard.summary.examName')}</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{getTestName(test) || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">{t('wizard.summary.questionsCount')}</dt>
            <dd className="font-extrabold text-[#2A3433]">
              {t('wizard.summary.questionsValue', { count: questionsCount })}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">{t('wizard.summary.totalScore')}</dt>
            <dd className="font-extrabold text-[#2A3433]">
              {t('wizard.summary.scoreValue', { count: totalScore })}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-semibold text-[#94A3B8]">{t('wizard.summary.monitoring')}</dt>
            <dd>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  monitoringActive
                    ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                    : 'bg-[#F1F5F9] text-[#94A3B8]'
                }`}
              >
                {monitoringActive ? t('wizard.summary.monitoringActive') : t('wizard.summary.monitoringInactive')}
              </span>
            </dd>
          </div>
        </dl>
      </aside>

      <div className="rounded-2xl bg-[#E8F7F6] p-4 ring-1 ring-[#CFECE9]">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#2AA8A2]" />
          <p className="text-xs leading-6 text-[#374151]">{t('wizard.summary.copyPasteTip')}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] via-[#2AA8A2] to-[#5EEAD4] p-5 text-white shadow-[0_12px_30px_rgba(42,168,162,0.28)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-extrabold">{t('wizard.summary.aiSecurity')}</p>
        </div>
        <div className="mt-4 flex items-center justify-center rounded-xl bg-white/10 p-6 backdrop-blur-sm">
          <ShieldCheck className="h-16 w-16 text-white/90" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-white/90">
          {t('wizard.summary.monitoringActiveBadge')}
        </p>
      </div>
    </div>
  )
}

export default ExamSettingsSummarySidebar
