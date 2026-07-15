import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'

function StudentsBreadcrumb() {
  const { t } = useTranslation(['navigation', 'members'])

  return (
    <nav className="mb-3 flex items-center gap-2 text-sm text-[var(--shell-text-muted)]">
      <Link to={ROUTES.DASHBOARD} className="transition hover:text-[var(--shell-accent)]">
        {t('home', { ns: 'navigation' })}
      </Link>
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      <Link to={ROUTES.MEMBERS} className="transition hover:text-[var(--shell-accent)]">
        {t('members', { ns: 'navigation' })}
      </Link>
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      <span className="font-semibold text-[var(--shell-accent)]">
        {t('students.pageTitle', { ns: 'members' })}
      </span>
    </nav>
  )
}

export default StudentsBreadcrumb
