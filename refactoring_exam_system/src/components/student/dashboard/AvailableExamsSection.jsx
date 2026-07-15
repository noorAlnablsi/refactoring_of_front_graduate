import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../constants/routes'
import StudentExamCard from './StudentExamCard'

function AvailableExamsSection({ exams }) {
  const { t } = useTranslation('student')

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-[#E5E9EB]/80">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-[#2A3433]">{t('availableExams.title')}</h2>
        <Link
          to={ROUTES.STUDENT_EXAMS}
          className="text-sm font-bold text-[#2AA8A2] transition hover:opacity-80"
        >
          {t('availableExams.viewAll')}
        </Link>
      </div>

      {exams.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <StudentExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#94A3B8]">{t('availableExams.empty')}</p>
      )}
    </section>
  )
}

export default AvailableExamsSection
