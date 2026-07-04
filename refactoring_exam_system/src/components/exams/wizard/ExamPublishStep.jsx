import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Copy,
  Link2,
  Rocket,
  Search,
  Users,
} from 'lucide-react'
import { getTestId } from '../../../lib/testModel'
import { useToastStore } from '../../../store/toastStore'

const inputClassName =
  'h-12 rounded-xl border border-[#E5E9EB] bg-[#F6F8F9] px-4 text-sm font-bold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

const PLACEHOLDER_GROUPS = [
  { id: 'physics-101', name: 'مجموعة الفيزياء - 101', students: 42 },
  { id: 'distinguished', name: 'مجموعة المتميزين', students: 15 },
  { id: 'science-b', name: 'قسم العلمي - شعبة ب', students: 38 },
  { id: 'late', name: 'الطلاب المتأخرين', students: 8 },
]

function getExamShareLink(test) {
  if (test?.share_url) return test.share_url
  if (test?.public_url) return test.public_url

  const testId = getTestId(test)
  const slug = test?.slug
  const path = slug ? `/exams/${slug}` : testId ? `/exams/${testId}` : '/exams'
  return `${window.location.origin}${path}`
}

function PublishSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} /> : null}
        <h3 className="text-base font-extrabold text-[#2A3433]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function GroupCard({ group, checked, onToggle }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${
        checked ? 'border-[#2AA8A2] bg-[#F8FDFC]' : 'border-[#E5E9EB] bg-[#FAFBFC]'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#2A3433]">{group.name}</p>
        <p className="mt-1 text-xs text-[#94A3B8]">{group.students} طالب</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 accent-[#2AA8A2]"
      />
    </label>
  )
}

function ExamPublishStep({
  test,
  onPublishNow,
  onSchedule,
  publishing,
  savingDraft = false,
  onBack,
  onSaveDraft,
}) {
  const showToast = useToastStore((s) => s.showToast)
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [selectedGroups, setSelectedGroups] = useState(['physics-101'])

  const shareLink = useMemo(() => getExamShareLink(test), [test])

  const filteredGroups = useMemo(() => {
    const query = groupSearch.trim().toLowerCase()
    if (!query) return PLACEHOLDER_GROUPS
    return PLACEHOLDER_GROUPS.filter((group) => group.name.toLowerCase().includes(query))
  }, [groupSearch])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      showToast('تم نسخ الرابط')
    } catch {
      showToast('تعذر نسخ الرابط', 'error')
    }
  }

  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!publishDate && !publishTime) {
      onPublishNow?.()
      return
    }

    if (!publishDate || !publishTime) {
      showToast('أدخل تاريخ ووقت النشر معاً، أو اترك الحقول فارغة للنشر الفوري', 'error')
      return
    }

    const publishAt = new Date(`${publishDate}T${publishTime}`)
    if (Number.isNaN(publishAt.getTime())) {
      showToast('تاريخ أو وقت النشر غير صالح', 'error')
      return
    }

    onSchedule?.({ publish_at: publishAt.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">الخطوة الأخيرة</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          النشر
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B]">
          حدّد موعد النشر أو انشر فوراً، ثم شارك رابط الاختبار مع طلابك.
        </p>
      </header>

      <PublishSection icon={CalendarClock} title="جدولة النشر">
        <p className="text-sm leading-7 text-[#64748B]">
          سيتم إرسال رابط الاختبار إلى الطلاب عبر الإيميل بالوقت الذي تحدده.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">تاريخ النشر</label>
            <input
              type="date"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">وقت النشر</label>
            <input
              type="time"
              value={publishTime}
              onChange={(event) => setPublishTime(event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-[#94A3B8]">* اترك الحقول فارغة للنشر الفوري.</p>
      </PublishSection>

      <PublishSection icon={Link2} title="خيارات المشاركة">
        <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
          رابط مباشر للاختبار
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={shareLink}
            className={`${inputClassName} min-w-0 flex-1 text-left`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(42,168,162,0.24)]"
          >
            <Copy className="h-4 w-4" />
            نسخ
          </button>
        </div>
      </PublishSection>

      <PublishSection icon={Users} title="إرسال للمجموعات">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={groupSearch}
            onChange={(event) => setGroupSearch(event.target.value)}
            placeholder="بحث عن طالب..."
            className={`${inputClassName} w-full pr-11`}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              checked={selectedGroups.includes(group.id)}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>
      </PublishSection>

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
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="text-sm font-bold text-[#64748B] hover:text-[#374151] disabled:opacity-50"
          >
            {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
          </button>

          <button
            type="submit"
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] disabled:opacity-60"
          >
            {publishing ? 'جاري النشر...' : 'نشر الاختبار الآن'}
            <Rocket className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  )
}

export default ExamPublishStep
