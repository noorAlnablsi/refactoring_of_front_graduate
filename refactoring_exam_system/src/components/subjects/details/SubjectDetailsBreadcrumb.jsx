import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../constants/routes'

function SubjectDetailsBreadcrumb() {
  const { t } = useTranslation('subjects')

  return (
    <nav className="text-sm" aria-label={t('details.breadcrumbLabel')}>
      <Link to={ROUTES.SUBJECTS} className="font-semibold text-[#2AA8A2] transition hover:opacity-80">
        {t('details.manageSubjects')}
      </Link>
      <span className="mx-2 text-[#CBD5E1]">›</span>
      <span className="font-medium text-[#64748B]">{t('details.subjectDetails')}</span>
    </nav>
  )
}

export default SubjectDetailsBreadcrumb
