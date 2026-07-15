import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Header() {
  const { t } = useTranslation('landing')

  return (
    <header className="border-b border-[#EAECEF] bg-white px-4 py-4 md:px-8 lg:px-10">
      <div dir="ltr" className="mx-auto flex w-full max-w-[1240px] items-center justify-between">
        <Link
          to="/login"
          className="rounded-xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-7 py-2.5 text-base font-bold leading-none text-white shadow-sm transition hover:opacity-95"
        >
          {t('header.login')}
        </Link>
        <div className="flex items-center gap-8 md:gap-10">
          <nav dir="rtl" className="hidden items-center gap-9 text-xl text-[#64748B] md:flex">
            <a href="#" className="font-semibold text-[#2AA8A2] underline decoration-[#2AA8A2] underline-offset-[12px]">
              {t('header.home')}
            </a>
            <a href="#" className="text-[#64748B] hover:text-[#64748B]">{t('header.solutions')}</a>
            <a href="#" className="text-[#64748B] hover:text-[#64748B]">{t('header.services')}</a>
            <a href="#" className="text-[#64748B] hover:text-[#64748B]">{t('header.about')}</a>
          </nav>
          <span className="text-4xl font-extrabold text-[#42BCB7]">QuizHub</span>
        </div>
      </div>
    </header>
  )
}

export default Header
