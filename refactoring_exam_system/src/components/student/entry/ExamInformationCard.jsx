import { BookOpen, GraduationCap, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function ExamInformationRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-start">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F6] text-[#2AA8A2]">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-[#2A3433]">{value || '—'}</p>
      </div>
    </div>
  )
}

function ExamInformationCard({ entry }) {
  const { t } = useTranslation('student')

  const duration = entry?.time?.durationMinutes
  const questions = entry?.summary?.questionsCount

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <h2 className="mb-4 text-base font-extrabold text-[#2A3433]">{t('entry.detailsTitle')}</h2>

      <div className="space-y-4">
        <ExamInformationRow
          icon={User}
          label={t('entry.student')}
          value={entry?.studentName || t('portal.defaultName')}
        />
        <ExamInformationRow icon={BookOpen} label={t('entry.subject')} value={entry?.subjectLabel} />
        <ExamInformationRow
          icon={GraduationCap}
          label={t('entry.teacher')}
          value={entry?.teacherName}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F6F8F9] px-3 py-3 text-start">
          <p className="text-[11px] font-semibold text-[#94A3B8]">{t('entry.duration')}</p>
          <p className="mt-1 text-sm font-extrabold text-[#2A3433]">
            {duration != null ? t('entry.durationValue', { minutes: duration }) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-[#F6F8F9] px-3 py-3 text-start">
          <p className="text-[11px] font-semibold text-[#94A3B8]">{t('entry.questions')}</p>
          <p className="mt-1 text-sm font-extrabold text-[#2A3433]">
            {t('entry.questionsValue', { count: questions ?? 0 })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ExamInformationCard
