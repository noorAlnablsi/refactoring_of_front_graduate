import { useTranslation } from 'react-i18next'
import { Eye, Sparkles } from 'lucide-react'
import { SettingsSwitch, SeverityCard } from './SettingsControls'

export function ExamProctoringSettingsSection({ cfg, severity, onSetSetting }) {
  const { t } = useTranslation('exams')

  return (
    <section className="overflow-hidden rounded-2xl bg-[#F8FDFC] ring-1 ring-[#CFECE9]">
      <div className="border-b border-[#CFECE9] px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F6]">
            <Sparkles className="h-5 w-5 text-[#2AA8A2]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2A3433]">{t('settings.proctoring.title')}</h3>
            <p className="mt-1 text-sm leading-7 text-[#64748B]">{t('settings.proctoring.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-6 py-4">
        <SettingsSwitch
          label={t('settings.proctoring.faceTracking')}
          description={t('settings.proctoring.faceTrackingDesc')}
          checked={cfg.face_tracking_enabled}
          onChange={(value) => onSetSetting('face_tracking_enabled', value)}
        />
        <SettingsSwitch
          label={t('settings.proctoring.ambientSound')}
          description={t('settings.proctoring.ambientSoundDesc')}
          checked={cfg.ambient_sound_monitoring}
          onChange={(value) => onSetSetting('ambient_sound_monitoring', value)}
        />
        <SettingsSwitch
          label={t('settings.proctoring.browserTracking')}
          description={t('settings.proctoring.browserTrackingDesc')}
          checked={cfg.browser_window_tracking}
          onChange={(value) => onSetSetting('browser_window_tracking', value)}
        />
        <SettingsSwitch
          label={t('settings.proctoring.preventCopyPaste')}
          description={t('settings.proctoring.preventCopyPasteDesc')}
          checked={cfg.prevent_copy_paste}
          onChange={(value) => onSetSetting('prevent_copy_paste', value)}
        />
      </div>

      <div className="border-t border-[#CFECE9] px-6 py-5">
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
