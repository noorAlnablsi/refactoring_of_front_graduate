import { Eye, Sparkles } from 'lucide-react'
import { SettingsSwitch, SeverityCard } from './SettingsControls'

export function ExamProctoringSettingsSection({ cfg, severity, onSetSetting }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#F8FDFC] ring-1 ring-[#CFECE9]">
      <div className="border-b border-[#CFECE9] px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F6]">
            <Sparkles className="h-5 w-5 text-[#2AA8A2]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2A3433]">
              المراقبة الذكية المدعومة بالذكاء الاصطناعي
            </h3>
            <p className="mt-1 text-sm leading-7 text-[#64748B]">
              تأمين بيئة الامتحان ومنع الغش باستخدام تقنيات التتبع المتقدمة.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-6 py-4">
        <SettingsSwitch
          label="تتبع بصمة الوجه"
          description="التحقق من هوية الطالب طوال فترة الامتحان"
          checked={cfg.face_tracking_enabled}
          onChange={(value) => onSetSetting('face_tracking_enabled', value)}
        />
        <SettingsSwitch
          label="رصد الأصوات المحيطة"
          description="تنبيه عند اكتشاف أصوات غريبة أو كلام"
          checked={cfg.ambient_sound_monitoring}
          onChange={(value) => onSetSetting('ambient_sound_monitoring', value)}
        />
        <SettingsSwitch
          label="تتبع نوافذ المتصفح"
          description="التنبيه عند مغادرة صفحة الامتحان"
          checked={cfg.browser_window_tracking}
          onChange={(value) => onSetSetting('browser_window_tracking', value)}
        />
        <SettingsSwitch
          label="منع النسخ واللصق"
          description="تعطيل اختصارات لوحة المفاتيح والماوس"
          checked={cfg.prevent_copy_paste}
          onChange={(value) => onSetSetting('prevent_copy_paste', value)}
        />
      </div>

      <div className="border-t border-[#CFECE9] px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#2AA8A2]" />
          <h4 className="text-sm font-extrabold text-[#2A3433]">سياسة المخالفات (Severity Policy)</h4>
        </div>
        <div className="space-y-3">
          <SeverityCard tone="action" title="إجراء صارم (Action)" text={severity.action} />
          <SeverityCard tone="warning" title="تحذير (Warning)" text={severity.warning} />
        </div>
      </div>
    </section>
  )
}
