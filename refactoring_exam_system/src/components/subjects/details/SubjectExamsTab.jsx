import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'

const placeholderExams = [
  { id: 1, name: 'Mechanics exam', status: 'completed' },
  { id: 2, name: 'Thermodynamics', status: 'active' },
  { id: 3, name: 'Electromagnetism exam', status: 'completed' },
]

function SubjectExamsTab() {
  const { t } = useTranslation('subjects')

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-[#E5E9EB]">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-[#94A3B8]" />
        <h2 className="text-lg font-bold text-[#2A3433]">{t('details.exams.title')}</h2>
      </div>
      <div className="space-y-3">
        {placeholderExams.map((exam) => (
          <div
            key={exam.id}
            className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFB] px-4 py-3 ring-1 ring-[#EEF2F3]"
          >
            <span className="text-sm font-semibold text-[#374151]">{exam.name}</span>
            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                exam.status === 'active'
                  ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {exam.status === 'active'
                ? t('details.examStatus.active')
                : t('details.examStatus.completed')}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-[#94A3B8]">{t('details.exams.apiNote')}</p>
    </div>
  )
}

export default SubjectExamsTab
