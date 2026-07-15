import { useTranslation } from 'react-i18next'
import educationLogo from '../../assets/landing/logo-education-center.png'
import saintLogo from '../../assets/landing/logo-saint.png'
import vintageLogo from '../../assets/landing/logo-vintage.png'

function BrandCircle({ src, alt, label, bgClass = 'bg-[#0F3554]' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-sm ${bgClass}`}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-white">{label}</span>
        )}
      </div>
    </div>
  )
}

function TrustedSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="bg-[#EDEFF0] px-4 py-14 md:px-8">
      <div className="mx-auto w-full max-w-6xl text-center">
        <h2 className="mx-auto mb-10 h-4 w-[489px] max-w-full text-center text-base font-bold text-[#5A6062]">
          {t('trusted.title')}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <BrandCircle src={vintageLogo} alt="Vintage School" />
          <BrandCircle label="GOLDEN" bgClass="bg-[#0B6B54]" />
          <BrandCircle src={saintLogo} alt="Saint college" />
          <BrandCircle src={educationLogo} alt="Education center" />
          <BrandCircle label="Knowledge" bgClass="bg-[#0A2C67]" />
        </div>
      </div>
    </section>
  )
}

export default TrustedSection
