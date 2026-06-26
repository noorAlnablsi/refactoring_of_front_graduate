import { useEffect, useState } from 'react'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none focus:ring-2 focus:ring-[#2AA8A2]/40'

const defaultSettings = {
  allow_review: true,
  shuffle_questions: true,
  shuffle_choices: false,
  allow_back_navigation: true,
  show_results_immediately: false,
  max_attempts: 1,
  ai_proctoring_enabled: false,
  tab_switch_limit: 3,
  fullscreen_required: false,
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-[#F6F8F9] px-4 py-3">
      <div>
        <p className="text-sm font-bold text-[#374151]">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-[#94A3B8]">{description}</p> : null}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-[#2AA8A2]"
      />
    </label>
  )
}

function ExamSettingsStep({ test, onSubmit, submitting, onBack }) {
  const existing = test?.settings_config || {}
  const [form, setForm] = useState({
    duration_minutes: test?.duration_minutes || 60,
    max_attempts: existing.max_attempts ?? defaultSettings.max_attempts,
    settings_config: { ...defaultSettings, ...existing },
  })

  useEffect(() => {
    const cfg = test?.settings_config || {}
    setForm({
      duration_minutes: test?.duration_minutes || 60,
      max_attempts: cfg.max_attempts ?? defaultSettings.max_attempts,
      settings_config: { ...defaultSettings, ...cfg },
    })
  }, [test])

  const setSetting = (key, value) => {
    setForm((prev) => ({
      ...prev,
      settings_config: { ...prev.settings_config, [key]: value },
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      duration_minutes: Number(form.duration_minutes) || 60,
      settings_config: {
        ...form.settings_config,
        max_attempts: Number(form.max_attempts) || 1,
      },
    })
  }

  const cfg = form.settings_config

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">إعدادات الامتحان</h2>
        <p className="mt-1 text-sm text-[#64748B]">اضبط سلوك الامتحان أثناء أداء الطلاب.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">المدة (دقيقة)</label>
            <input
              type="number"
              min={1}
              value={form.duration_minutes}
              onChange={(e) => setForm((prev) => ({ ...prev, duration_minutes: e.target.value }))}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#374151]">عدد المحاولات</label>
            <input
              type="number"
              min={1}
              value={form.max_attempts}
              onChange={(e) => setForm((prev) => ({ ...prev, max_attempts: e.target.value }))}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-extrabold text-[#2A3433]">التنقل والإجابات</p>
          <Toggle
            label="السماح بالمراجعة قبل التسليم"
            checked={cfg.allow_review}
            onChange={(v) => setSetting('allow_review', v)}
          />
          <Toggle
            label="السماح بالعودة للأسئلة السابقة"
            checked={cfg.allow_back_navigation}
            onChange={(v) => setSetting('allow_back_navigation', v)}
          />
          <Toggle
            label="خلط ترتيب الأسئلة"
            checked={cfg.shuffle_questions}
            onChange={(v) => setSetting('shuffle_questions', v)}
          />
          <Toggle
            label="خلط ترتيب الخيارات"
            checked={cfg.shuffle_choices}
            onChange={(v) => setSetting('shuffle_choices', v)}
          />
          <Toggle
            label="عرض النتيجة فوراً بعد التسليم"
            checked={cfg.show_results_immediately}
            onChange={(v) => setSetting('show_results_immediately', v)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#2A3433]">المراقبة الذكية (AI Proctoring)</h3>
            <p className="mt-1 text-xs text-[#94A3B8]">تتبع مخالفات أثناء أداء الامتحان</p>
          </div>
          <input
            type="checkbox"
            checked={cfg.ai_proctoring_enabled}
            onChange={(e) => setSetting('ai_proctoring_enabled', e.target.checked)}
            className="h-5 w-5 accent-[#2AA8A2]"
          />
        </div>

        {cfg.ai_proctoring_enabled ? (
          <div className="mt-4 space-y-2">
            <Toggle
              label="إلزام وضع ملء الشاشة"
              checked={cfg.fullscreen_required}
              onChange={(v) => setSetting('fullscreen_required', v)}
            />
            <div>
              <label className="mb-2 block text-sm font-bold text-[#374151]">
                حد تبديل التبويبات المسموح
              </label>
              <input
                type="number"
                min={0}
                value={cfg.tab_switch_limit}
                onChange={(e) => setSetting('tab_switch_limit', Number(e.target.value))}
                className={inputClassName}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
        >
          السابق
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? 'جاري الحفظ...' : 'التالي — المراجعة'}
        </button>
      </div>
    </form>
  )
}

export default ExamSettingsStep
