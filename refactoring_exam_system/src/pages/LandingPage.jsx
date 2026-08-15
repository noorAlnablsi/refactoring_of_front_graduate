import CtaSection from '../components/landing/CtaSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HeroSection from '../components/landing/HeroSection'
import Footer from '../components/landing/Footer'
import Header from '../components/landing/Header'
import SolutionsSection from '../components/landing/SolutionsSection'
import TrustedSection from '../components/landing/TrustedSection'
import { getLanguageDirection } from '../lib/language'
import { useLanguageStore } from '../store/languageStore'

function LandingPage() {
  const language = useLanguageStore((s) => s.language)
  const dir = getLanguageDirection(language)

  return (
    <main dir={dir} className="min-h-screen bg-[#F6F8F9] font-sans text-[#1F2533]">
      <Header />
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <SolutionsSection />
      <CtaSection />
      <Footer />
    </main>
  )
}

export default LandingPage
