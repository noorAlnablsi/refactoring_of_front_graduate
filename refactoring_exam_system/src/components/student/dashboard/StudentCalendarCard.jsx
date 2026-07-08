import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  return cells
}

function StudentCalendarCard({ getEventDaysForMonth }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const currentDay = today.getDate()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const cells = buildMonthGrid(year, month)
  const eventDays = useMemo(
    () => new Set(getEventDaysForMonth?.(year, month) || []),
    [getEventDaysForMonth, year, month],
  )

  const shiftMonth = (delta) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F6F8F9] hover:text-[#64748B]"
          aria-label="الشهر السابق"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <h2 className="text-center text-sm font-extrabold text-[#2A3433]">
          {MONTHS_AR[month]} {year}
        </h2>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F6F8F9] hover:text-[#64748B]"
          aria-label="الشهر التالي"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-[#94A3B8]">
        {WEEKDAYS_AR.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-0.5 grid grid-cols-7 gap-0.5 text-center">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="h-8" />
          }

          const isToday = isCurrentMonth && day === currentDay
          const hasEvent = eventDays.has(day)

          return (
            <div key={`${year}-${month}-${day}`} className="flex h-8 flex-col items-center justify-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday ? 'bg-[#2AA8A2] text-white' : 'text-[#374151]'
                }`}
              >
                {day}
              </span>
              {hasEvent ? <span className="mt-0.5 h-1 w-1 rounded-full bg-[#2AA8A2]" /> : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default StudentCalendarCard
