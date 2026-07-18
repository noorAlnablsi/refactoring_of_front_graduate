import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock3 } from 'lucide-react'
import { ROUTES } from '../../constants/routes'

function StudentResultStatusPage({ mode = 'results' }) {
  const { t } = useTranslation('student')
  const location = useLocation()
  const submit = location.state?.submit
  const isPending = mode === 'pending'

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-[#E5E9EB]">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isPending ? 'bg-[#FFF7ED] text-[#C2410C]' : 'bg-[#E8F7F6] text-[#2AA8A2]'
        }`}
      >
        {isPending ? <Clock3 className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
      </div>

      <h1 className="mt-5 text-2xl font-extrabold text-[#2A3433]">
        {isPending ? t('results.pendingTitle') : t('results.readyTitle')}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#64748B]">
        {submit?.message ||
          (isPending ? t('results.pendingDescription') : t('results.readyDescription'))}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ROUTES.STUDENT_DASHBOARD}
          className="rounded-xl bg-[#2AA8A2] px-5 py-3 text-sm font-bold text-white"
        >
          {t('attempt.backToDashboard')}
        </Link>
        <Link
          to={ROUTES.STUDENT_RESULTS}
          className="rounded-xl bg-[#F1F5F9] px-5 py-3 text-sm font-bold text-[#64748B]"
        >
          {t('sidebar.results')}
        </Link>
      </div>
    </div>
  )
}

export default StudentResultStatusPage
