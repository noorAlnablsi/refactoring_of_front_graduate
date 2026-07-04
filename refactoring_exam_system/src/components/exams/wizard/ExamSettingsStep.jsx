import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  ClipboardList,
  Eye,
  Lock,
  Navigation,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import {
  buildTestSettingsFormState,
  buildTestSettingsPayload,
  DEFAULT_SEVERITY_POLICY,
} from '../../../lib/testSettings'

const inputClassName =
  'h-12 w-full rounded-xl border border-[#E5E9EB] bg-white px-4 text-center text-lg font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

function SettingsSection({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB] ${className}`}>
      <div className="mb-5 flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} /> : null}
        <h3 className="text-base font-extrabold text-[#2A3433]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function SettingsSwitch({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-1 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#2A3433]">{label}</p>
        {description ? <p className="mt-1 text-xs leading-6 text-[#94A3B8]">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-[#2AA8A2]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
          }`}
        />
      </button>
    </label>
  )
}

function SettingsRadio({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#F6F8F9] px-4 py-3.5">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked ? 'border-[#2AA8A2]' : 'border-[#CBD5E1]'
        }`}
      >
        {checked ? <span className="h-2.5 w-2.5 rounded-full bg-[#2AA8A2]" /> : null}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  )
}

function SeverityCard({ tone, title, text }) {
  const isAction = tone === 'action'

  return (
    <div
      className={`rounded-xl p-4 ${
        isAction ? 'bg-[#FEF2F2] ring-1 ring-[#FECACA]' : 'bg-[#E8F7F6] ring-1 ring-[#CFECE9]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isAction ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          ) : (
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#2AA8A2]" />
          )}
          <div>
            <p
              className={`text-sm font-extrabold ${
                isAction ? 'text-[#DC2626]' : 'text-[#2AA8A2]'
              }`}
            >
              {title}
            </p>
            <p className="mt-2 text-xs leading-6 text-[#64748B]">{text}</p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-bold text-[#94A3B8] hover:text-[#64748B]"
        >
          تعديل
        </button>
      </div>
    </div>
  )
}

function ExamSettingsStep({
  test,
  onSubmit,
  submitting,
  savingDraft = false,
  onBack,
  onSaveDraft,
  onFormChange,
}) {
  const [form, setForm] = useState(() => buildTestSettingsFormState(test))

  useEffect(() => {
    const next = buildTestSettingsFormState(test)
    setForm(next)
  }, [test])

  useEffect(() => {
    onFormChange?.(form.settings_config)
  }, [form.settings_config, onFormChange])

  const setSetting = (key, value) => {
    setForm((prev) => ({
      ...prev,
      settings_config: { ...prev.settings_config, [key]: value },
    }))
  }

  const setNavigationMode = (sequential) => {
    setForm((prev) => ({
      ...prev,
      settings_config: {
        ...prev.settings_config,
        force_sequential_navigation: sequential,
        allow_back_navigation: !sequential,
      },
    }))
  }

  const setAnswerRule = (requireAll) => {
    setForm((prev) => ({
      ...prev,
      settings_config: {
        ...prev.settings_config,
        require_all_answers: requireAll,
        allow_skip_questions: !requireAll,
      },
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(buildTestSettingsPayload(form))
  }

  const handleSaveDraftClick = () => {
    onSaveDraft?.(buildTestSettingsPayload(form))
  }

  const cfg = form.settings_config
  const severity = cfg.severity_policy || DEFAULT_SEVERITY_POLICY

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">إعدادات الامتحان والتحكم</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          الإعدادات
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          اضبط سلوك الامتحان أثناء أداء الطلاب، وفعّل خيارات المراقبة الذكية عند الحاجة.
        </p>
      </header>

      <SettingsSection icon={ClipboardList} title="إعدادات المحاولة">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">
              الزمن المحدد (بالدقائق)
            </label>
            <input
              type="number"
              min={1}
              value={form.duration_minutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, duration_minutes: event.target.value }))
              }
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">
              عدد المحاولات المسموحة
            </label>
            <input
              type="number"
              min={1}
              value={form.max_attempts}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, max_attempts: event.target.value }))
              }
              className={inputClassName}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Navigation} title="إعدادات التنقل">
        <div className="space-y-3">
          <div onClick={() => setNavigationMode(true)}>
            <SettingsRadio
              label="فرض التنقل المتسلسل"
              checked={cfg.force_sequential_navigation}
              onChange={() => setNavigationMode(true)}
            />
          </div>
          <div onClick={() => setNavigationMode(false)}>
            <SettingsRadio
              label="السماح بالعودة للأسئلة السابقة"
              checked={cfg.allow_back_navigation}
              onChange={() => setNavigationMode(false)}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Lock} title="قواعد الإجابة">
        <div className="space-y-3">
          <div onClick={() => setAnswerRule(true)}>
            <SettingsRadio
              label="إلزامية الإجابة على كل الأسئلة"
              checked={cfg.require_all_answers}
              onChange={() => setAnswerRule(true)}
            />
          </div>
          <div onClick={() => setAnswerRule(false)}>
            <SettingsRadio
              label="السماح بتخطي الأسئلة"
              checked={cfg.allow_skip_questions}
              onChange={() => setAnswerRule(false)}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Shuffle} title="عرض الأسئلة">
        <div className="divide-y divide-[#EEF2F4]">
          <SettingsSwitch
            label="ترتيب عشوائي للأسئلة"
            checked={cfg.shuffle_questions}
            onChange={(value) => setSetting('shuffle_questions', value)}
          />
          <SettingsSwitch
            label="ترتيب عشوائي للخيارات"
            checked={cfg.shuffle_choices}
            onChange={(value) => setSetting('shuffle_choices', value)}
          />
        </div>
      </SettingsSection>

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
            onChange={(value) => setSetting('face_tracking_enabled', value)}
          />
          <SettingsSwitch
            label="رصد الأصوات المحيطة"
            description="تنبيه عند اكتشاف أصوات غريبة أو كلام"
            checked={cfg.ambient_sound_monitoring}
            onChange={(value) => setSetting('ambient_sound_monitoring', value)}
          />
          <SettingsSwitch
            label="تتبع نوافذ المتصفح"
            description="التنبيه عند مغادرة صفحة الامتحان"
            checked={cfg.browser_window_tracking}
            onChange={(value) => setSetting('browser_window_tracking', value)}
          />
          <SettingsSwitch
            label="منع النسخ واللصق"
            description="تعطيل اختصارات لوحة المفاتيح والماوس"
            checked={cfg.prevent_copy_paste}
            onChange={(value) => setSetting('prevent_copy_paste', value)}
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

      <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-[#E5E9EB] bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          <button
            type="button"
            onClick={handleSaveDraftClick}
            disabled={savingDraft}
            className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
          >
            {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-60"
          >
            {submitting ? 'جاري الحفظ...' : 'المتابعة للمعاينة'}
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  )
}

export default ExamSettingsStep
