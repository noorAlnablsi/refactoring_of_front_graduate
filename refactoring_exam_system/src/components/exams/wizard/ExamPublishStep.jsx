import { useState } from 'react'
import { Users } from 'lucide-react'

import { getTestName } from '../../../lib/testModel'

const inputClassName =
  'w-full rounded-xl bg-[#F6F8F9] px-4 py-3 text-sm text-[#374151] outline-none focus:ring-2 focus:ring-[#2AA8A2]/40'

function ExamPublishStep({ test, onPublishNow, onSchedule, publishing, onBack }) {
  const [mode, setMode] = useState('now')
  const [publishAt, setPublishAt] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mode === 'now') {
      onPublishNow?.()
    } else {
      onSchedule?.({ publish_at: new Date(publishAt).toISOString() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">نشر الامتحان</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          انشر الامتحان فوراً أو جدوله لوقت لاحق.
        </p>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E9EB] p-4">
            <input
              type="radio"
              name="publish_mode"
              checked={mode === 'now'}
              onChange={() => setMode('now')}
              className="accent-[#2AA8A2]"
            />
            <div>
              <p className="text-sm font-bold text-[#374151]">نشر فوري</p>
              <p className="text-xs text-[#94A3B8]">يصبح الامتحان متاحاً للطلاب مباشرة</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E9EB] p-4">
            <input
              type="radio"
              name="publish_mode"
              checked={mode === 'schedule'}
              onChange={() => setMode('schedule')}
              className="accent-[#2AA8A2]"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#374151]">جدولة النشر</p>
              <p className="text-xs text-[#94A3B8]">تحديد وقت مستقبلي لنشر الامتحان</p>
              {mode === 'schedule' ? (
                <input
                  required
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className={`${inputClassName} mt-3`}
                />
              ) : null}
            </div>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#FAFBFC] p-6">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-[#94A3B8]" />
          <div>
            <p className="text-sm font-extrabold text-[#64748B]">مجموعات الطلاب</p>
            <p className="mt-1 text-xs leading-6 text-[#94A3B8]">
              قريباً — ستتمكن من تحديد مجموعات طلاب محددة عند النشر.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#E8F7F6] p-4 text-sm text-[#2AA8A2]">
        <p className="font-bold">{getTestName(test)}</p>
        <p className="mt-1 text-xs text-[#64748B]">
          {test?.questions?.length || 0} سؤال · {test?.duration_minutes || '—'} دقيقة
        </p>
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
          disabled={publishing}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {publishing ? 'جاري النشر...' : mode === 'now' ? 'نشر الامتحان' : 'جدولة النشر'}
        </button>
      </div>
    </form>
  )
}

export default ExamPublishStep
