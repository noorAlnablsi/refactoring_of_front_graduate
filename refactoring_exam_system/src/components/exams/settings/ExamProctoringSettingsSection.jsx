import { useTranslation } from 'react-i18next'
import { Eye, Sparkles } from 'lucide-react'
import { SettingsSwitch, SeverityCard } from './SettingsControls'

export function ExamProctoringSettingsSection({ cfg, severity, onSetSetting }) {
  const { t } = useTranslation('exams')
  const masterEnabled = Boolean(cfg.ai_proctoring_enabled)

  const setMasterEnabled = (value) => {
    onSetSetting('ai_proctoring_enabled', value)
    if (!value) {

      onSetSetting('face_tracking_enabled', false)
      onSetSetting('ambient_sound_monitoring', false)
      onSetSetting('browser_window_tracking', false)
      onSetSetting('prevent_copy_paste', false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-[#F8FDFC] ring-1 ring-[#CFECE9]">
      <div className="border-b border-[#CFECE9] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F6]">
              <Sparkles className="h-5 w-5 text-[#2AA8A2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2A3433]">{t('settings.proctoring.title')}</h3>
              <p className="mt-1 text-sm leading-7 text-[#64748B]">{t('settings.proctoring.subtitle')}</p>
            </div>
          </div>
          <div className="shrink-0">
            <SettingsSwitch
              label=""
              checked={masterEnabled}
              onChange={(value) => setMasterEnabled(value)}
              emphasized
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 px-6 py-4">
        <SettingsSwitch
          label={t('settings.proctoring.faceTracking')}
          description={t('settings.proctoring.faceTrackingDesc')}
          checked={masterEnabled && Boolean(cfg.face_tracking_enabled)}
          onChange={(value) => masterEnabled && onSetSetting('face_tracking_enabled', value)}
          disabled={!masterEnabled}
        />
        <SettingsSwitch
          label={t('settings.proctoring.ambientSound')}
          description={t('settings.proctoring.ambientSoundDesc')}
          checked={masterEnabled && Boolean(cfg.ambient_sound_monitoring)}
          onChange={(value) => masterEnabled && onSetSetting('ambient_sound_monitoring', value)}
          disabled={!masterEnabled}
        />
        <SettingsSwitch
          label={t('settings.proctoring.browserTracking')}
          description={t('settings.proctoring.browserTrackingDesc')}
          checked={masterEnabled && Boolean(cfg.browser_window_tracking)}
          onChange={(value) => masterEnabled && onSetSetting('browser_window_tracking', value)}
          disabled={!masterEnabled}
        />
        <SettingsSwitch
          label={t('settings.proctoring.preventCopyPaste')}
          description={t('settings.proctoring.preventCopyPasteDesc')}
          checked={masterEnabled && Boolean(cfg.prevent_copy_paste)}
          onChange={(value) => masterEnabled && onSetSetting('prevent_copy_paste', value)}
          disabled={!masterEnabled}
        />
      </div>

      <div
        className={`border-t border-[#CFECE9] px-6 py-5 ${
          masterEnabled ? '' : 'pointer-events-none opacity-60'
        }`}
      >
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#2AA8A2]" />
          <h4 className="text-sm font-extrabold text-[#2A3433]">{t('settings.proctoring.severityPolicy')}</h4>
        </div>
        <div className="space-y-3">
          <SeverityCard tone="action" title={t('settings.severity.actionTitle')} text={severity.action} />
          <SeverityCard tone="warning" title={t('settings.severity.warningTitle')} text={severity.warning} />
        </div>
      </div>
    </section>
  )
}
