import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

function CtaSection() {
  return (
    <section className="bg-white px-4 pb-16 md:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-[40px] bg-gradient-to-r from-[#2AA8A2] to-[#4ABAB5] px-6 py-14 text-center text-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] md:px-12">
        <h2 className="mb-6 text-4xl font-extrabold md:text-5xl">جاهز للارتقاء بمؤسستك؟</h2>
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-9 text-white/90 md:text-xl">
          انضم إلى مئات الجامعات والمدارس التي تعمل على تحويل استراتيجية التقييم الخاصة بها باستخدام إدو أسيس.
        </p>

        <div className="relative mx-auto w-full max-w-xl">
          <Link
            to={ROUTES.REGISTER_SELECT_ROLE}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-10 py-4 text-xl font-bold text-[#2AA8A2] shadow-[0_14px_32px_rgba(0,0,0,0.16)] md:text-2xl"
          >
            إنشاء حساب للمؤسسة
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CtaSection

