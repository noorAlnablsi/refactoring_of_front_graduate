import { useTranslation } from 'react-i18next'
import iconEmail from '../../assets/landing/icon-contact-email.png'
import iconAt from '../../assets/landing/icon-contact-at.png'
import iconGlobe from '../../assets/landing/icon-contact-globe.png'

function Footer() {
  const { t } = useTranslation('landing')

  return (
    <footer className="bg-white px-4 py-14 text-right md:px-8">
      <div dir="rtl" className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-4">
        <div className="space-y-5">
          <h3 className="text-2xl font-extrabold text-[#2AA8A2]">QuizHub</h3>
          <p className="text-base leading-8 text-[#5F6675]">{t('footer.tagline')}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">{t('footer.platform')}</h4>
          <ul className="space-y-3 text-base text-[#69707F]">
            <li>{t('footer.platformLinks.assessmentEngine')}</li>
            <li>{t('footer.platformLinks.questionBanks')}</li>
            <li>{t('footer.platformLinks.aiGenerator')}</li>
            <li>{t('footer.platformLinks.analyticsPortal')}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">{t('footer.company')}</h4>
          <ul className="space-y-3 text-base text-[#69707F]">
            <li>{t('footer.companyLinks.about')}</li>
            <li>{t('footer.companyLinks.caseStudies')}</li>
            <li>{t('footer.companyLinks.partners')}</li>
            <li>{t('footer.companyLinks.privacy')}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">{t('footer.contact')}</h4>
          <div className="flex justify-start gap-3">
            <img src={iconEmail} alt="Email" className="h-10 w-10 rounded-full" />
            <img src={iconAt} alt="At" className="h-10 w-10 rounded-full" />
            <img src={iconGlobe} alt="Website" className="h-10 w-10 rounded-full" />
          </div>
          <p className="text-sm text-[#7B8291]">{t('footer.supportEmail')}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[#E5E9EB] pt-6 text-sm text-[#808796]">
        <div className="flex flex-wrap gap-6">
          <a href="#">{t('footer.security')}</a>
          <a href="#">{t('footer.cookies')}</a>
          <a href="#">{t('footer.terms')}</a>
        </div>
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}

export default Footer
