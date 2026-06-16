import CtaSection from '../components/landing/CtaSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HeroSection from '../components/landing/HeroSection'
import Footer from '../components/landing/Footer'
import Header from '../components/landing/Header'
import TrustedSection from '../components/landing/TrustedSection'

function LandingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F6F8F9] font-sans text-[#1F2533]">
      <Header />
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </main>
  )
}

export default LandingPage
