import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../constants/routes'

function PasswordResetShell({ children, cardClassName = '' }) {
  const { t } = useTranslation(['landing', 'auth', 'common'])

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#F8FAFB] via-[#F6F8F9] to-[#EEF6F5] px-4 py-6 font-sans text-[#1F2533] md:px-10 md:py-8">
      <div className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-[#2AA8A2]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-8 h-96 w-96 rounded-full bg-[#2AA8A2]/10 blur-3xl" />

      <header
        dir="ltr"
        className="relative mx-auto grid w-full max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center"
      >
        <div className="justify-self-start">
          <Link to={ROUTES.LOGIN} className="text-sm font-bold text-[#2AA8A2]">
            {t('landing:header.login')}
          </Link>
        </div>
        <nav className="hidden items-center justify-center gap-10 text-base font-medium text-[#64748B] md:flex">
          <a href="#" className="hover:text-[#2AA8A2]">
            {t('landing:footer.platformLinks.questionBanks')}
          </a>
          <a href="#" className="hover:text-[#2AA8A2]">
            {t('landing:header.about')}
          </a>
          <a href="#" className="hover:text-[#2AA8A2]">
            {t('landing:header.solutions')}
          </a>
        </nav>
        <div className="justify-self-end">
          <Link to={ROUTES.HOME} className="text-[28px] font-extrabold leading-none text-[#2AA8A2]">
            QuizHub
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center justify-center py-10 md:py-14">
        <div
          className={`w-full max-w-[440px] rounded-[24px] bg-white px-8 py-12 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-12 md:py-14 ${cardClassName}`}
        >
          {children}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-[#94A3B8]">{t('auth:shell.securityStandards')}</p>
          <div className="mt-5 flex items-center justify-center gap-10 text-sm font-semibold text-[#64748B]">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F7F6]">
                <Check className="h-3.5 w-3.5 text-[#2AA8A2]" strokeWidth={3} />
              </span>
              SAML 2.0
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F7F6]">
                <Check className="h-3.5 w-3.5 text-[#2AA8A2]" strokeWidth={3} />
              </span>
              AES-256
            </span>
          </div>
        </div>
      </section>

      <footer
        dir="ltr"
        className="relative mx-auto mt-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-[#E5E9EB] pt-6 text-xs text-[#6B7280]"
      >
        <p>{t('landing:footer.copyright')}</p>
        <div className="flex flex-wrap items-center gap-8">
          <a href="#">{t('landing:footer.contact')}</a>
          <a href="#">{t('landing:footer.cookies')}</a>
          <a href="#">{t('landing:footer.terms')}</a>
          <a href="#">{t('landing:footer.companyLinks.privacy')}</a>
        </div>
      </footer>
    </main>
  )
}

export default PasswordResetShell
