import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import MobileNavDrawer from '../common/MobileNavDrawer'

const NAV_ITEMS = [
  { id: 'home', labelKey: 'header.home' },
  { id: 'about', labelKey: 'header.about' },
  { id: 'solutions', labelKey: 'header.solutions' },
]

function readActiveSection() {
  const hash = window.location.hash.replace('#', '')
  if (NAV_ITEMS.some((item) => item.id === hash)) return hash
  return 'home'
}

function Header() {
  const { t } = useTranslation('landing')
  const [activeSection, setActiveSection] = useState(readActiveSection)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const sync = () => setActiveSection(readActiveSection())
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const closeOnResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('resize', closeOnResize)
    return () => window.removeEventListener('resize', closeOnResize)
  }, [])

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAECEF] bg-white/95 px-4 py-4 backdrop-blur md:px-8 lg:px-10">
      <div dir="ltr" className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F6F8F9] hover:text-[#2AA8A2] md:hidden"
            aria-label={t('header.openMenu')}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <Link
            to="/login"
            className="rounded-xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-4 py-2.5 text-sm font-bold leading-none text-white shadow-sm transition hover:opacity-95 sm:px-7 sm:text-base"
          >
            {t('header.login')}
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-6 md:gap-10">
          <nav dir="rtl" className="hidden items-center gap-9 text-xl text-[#64748B] md:flex">
            {NAV_ITEMS.map(({ id, labelKey }) => {
              const isActive = activeSection === id
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={
                    isActive
                      ? 'font-semibold text-[#2AA8A2] underline decoration-[#2AA8A2] underline-offset-[12px]'
                      : 'text-[#64748B] transition hover:text-[#2AA8A2]'
                  }
                >
                  {t(labelKey)}
                </a>
              )
            })}
          </nav>
          <a href="#home" className="truncate text-2xl font-extrabold text-[#42BCB7] sm:text-4xl">
            QuizHub
          </a>
        </div>
      </div>

      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={closeMobileNav}
        title="QuizHub"
        closeLabel={t('header.closeMenu')}
        visibilityClassName="md:hidden"
        widthClassName="w-[min(300px,88vw)]"
      >
        <nav dir="rtl" className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ id, labelKey }) => {
            const isActive = activeSection === id
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={closeMobileNav}
                className={`rounded-xl px-4 py-3 text-base font-bold transition ${
                  isActive
                    ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                    : 'text-[#64748B] hover:bg-[#F6F8F9] hover:text-[#2AA8A2]'
                }`}
              >
                {t(labelKey)}
              </a>
            )
          })}
          <Link
            to="/login"
            onClick={closeMobileNav}
            className="mt-3 rounded-xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-4 py-3 text-center text-base font-bold text-white"
          >
            {t('header.login')}
          </Link>
        </nav>
      </MobileNavDrawer>
    </header>
  )
}

export default Header
