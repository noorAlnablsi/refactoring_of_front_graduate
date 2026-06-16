import iconEmail from '../../assets/landing/icon-contact-email.png'
import iconAt from '../../assets/landing/icon-contact-at.png'
import iconGlobe from '../../assets/landing/icon-contact-globe.png'

function Footer() {
  return (
    <footer className="bg-white px-4 py-14 text-right md:px-8">
      <div dir="rtl" className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-4">
        <div className="space-y-5">
          <h3 className="text-2xl font-extrabold text-[#2AA8A2]">QuizHub</h3>
          <p className="text-base leading-8 text-[#5F6675]">
            نوفر البنية التحتية للحل القادم من التميز الأكاديمي.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">المنصة</h4>
          <ul className="space-y-3 text-base text-[#69707F]">
            <li>محرك التقييم</li>
            <li>بنوك الأسئلة</li>
            <li>مولد الذكاء الاصطناعي</li>
            <li>بوابة التحليلات</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">الشركة</h4>
          <ul className="space-y-3 text-base text-[#69707F]">
            <li>من نحن</li>
            <li>دراسات الحالة</li>
            <li>برنامج الشركاء</li>
            <li>سياسة الخصوصية</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#2A3040]">تواصل معنا</h4>
          <div className="flex justify-start gap-3">
            <img src={iconEmail} alt="Email" className="h-10 w-10 rounded-full" />
            <img src={iconAt} alt="At" className="h-10 w-10 rounded-full" />
            <img src={iconGlobe} alt="Website" className="h-10 w-10 rounded-full" />
          </div>
          <p className="text-sm text-[#7B8291]">support@eduassess.com</p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[#E5E9EB] pt-6 text-sm text-[#808796]">
        <div className="flex flex-wrap gap-6">
          <a href="#">الأمن</a>
          <a href="#">ملفات التعريف</a>
          <a href="#">شروط الخدمة</a>
        </div>
        <p>© ادو أسيس 2024. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}

export default Footer

