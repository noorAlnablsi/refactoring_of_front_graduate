import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { useAppTranslation } from '../../../hooks/useAppTranslation'

const linkClassName =
  'inline-flex items-center gap-2 text-sm font-bold text-[#2AA8A2] transition hover:opacity-80'

function BackToLoginLink({ onClick, className = '' }) {
  const { t } = useAppTranslation('auth')

  const content = (
    <>
      <span>{t('backToLogin')}</span>
      <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${linkClassName} ${className}`}>
        {content}
      </button>
    )
  }

  return (
    <Link to={ROUTES.LOGIN} className={`${linkClassName} ${className}`}>
      {content}
    </Link>
  )
}

export default BackToLoginLink
