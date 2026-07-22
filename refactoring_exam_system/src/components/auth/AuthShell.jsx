import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import { getLanguageDirection } from '../../lib/language'
import { useLanguageStore } from '../../store/languageStore'
import AuthHeroPanel from './AuthHeroPanel'

function AuthShell({
  children,
  heroImage,
  heroAlt = '',
  heroImagePosition = 'center',
  contentAlign = 'center',
}) {
  const { t } = useTranslation(['auth', 'common'])
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)
  const contentClassName =
    contentAlign === 'top'
      ? 'justify-start pt-8 md:pt-10 lg:pt-14'
      : 'justify-center'

  return (
    <main
      dir={dir}
      className="min-h-screen bg-[var(--shell-bg)] px-4 py-6 font-sans text-[var(--shell-text)] md:px-8"
    >
      <header dir="ltr" className="mx-auto flex w-full max-w-[1240px] items-center justify-between">
        <p className="text-sm text-[var(--shell-text-muted)]">{t('brand.tagline')}</p>
        <Link
          to={ROUTES.HOME}
          className="text-[28px] font-extrabold leading-none text-[var(--shell-accent)]"
        >
          {t('brand.quizHub')}
        </Link>
      </header>

      <section className="mx-auto mt-8 w-full max-w-[1240px]">
        <div
          dir="ltr"
          className="mx-auto flex w-full max-w-[1152px] flex-col overflow-hidden rounded-[24px] bg-[var(--shell-surface)] shadow-[var(--shell-shadow)] lg:h-[700px] lg:flex-row"
        >
          <div
            dir={dir}
            className={`flex w-full flex-col p-8 md:px-10 md:py-10 lg:h-[700px] lg:w-[576px] lg:overflow-y-auto lg:py-12 ${contentClassName}`}
          >
            {children}
          </div>

          <AuthHeroPanel image={heroImage} alt={heroAlt} imagePosition={heroImagePosition} />
        </div>
      </section>

      <footer
        dir="ltr"
        className="mx-auto mt-10 flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 text-xs text-[var(--shell-text-muted)]"
      >
        <p>{t('footer.copyright', { ns: 'common' })}</p>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#">{t('footer.support', { ns: 'common' })}</a>
          <a href="#">{t('footer.cookies', { ns: 'common' })}</a>
          <a href="#">{t('footer.terms', { ns: 'common' })}</a>
          <a href="#">{t('footer.privacy', { ns: 'common' })}</a>
        </div>
      </footer>
    </main>
  )
}

export default AuthShell
