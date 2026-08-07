import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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

  useEffect(() => {
    const sync = () => setActiveSection(readActiveSection())
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAECEF] bg-white/95 px-4 py-4 backdrop-blur md:px-8 lg:px-10">
      <div dir="ltr" className="mx-auto flex w-full max-w-[1240px] items-center justify-between">
        <Link
          to="/login"
          className="rounded-xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-7 py-2.5 text-base font-bold leading-none text-white shadow-sm transition hover:opacity-95"
        >
          {t('header.login')}
        </Link>
        <div className="flex items-center gap-8 md:gap-10">
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
          <a href="#home" className="text-4xl font-extrabold text-[#42BCB7]">
            QuizHub
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
