import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import heroGrid from '../../assets/landing/hero-grid.png'

function HeroSection() {
  return (
    <section className="bg-[#F4F6F8] px-4 py-12 md:px-8 md:py-16 lg:py-20">
      <div dir="ltr" className="mx-auto grid w-full max-w-[1240px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div dir="rtl" className="order-2 space-y-8 text-center lg:order-2 lg:text-right">
          <span className="inline-block rounded-full bg-[#DFF4F3] px-5 py-2 text-sm font-semibold leading-none text-[#2EAFAA]">
            مبدأ المنصة
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.2] text-[#1E2432] md:text-6xl">
            اختبارات مرنة،
            <br />
            <span className="text-[#36BDB7]">أمان أفضل</span>
          </h1>
          <p className="mx-auto max-w-[620px] text-lg leading-[1.8] text-[#626A79] lg:mx-0">
            تمكين المؤسسات التعليمية من خلال إنشاء الاختبارات بشكل مرن مع التحليلات العميقة
            وتوفير ميزات الأمان القوية. قم بتبسيط سير العملية التعليمية مع ضمان النزاهة الأكاديمية.
          </p>
          <Link
            to={ROUTES.WELCOME}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#39C1BB] to-[#67CFC5] px-8 py-5 text-2xl font-bold leading-none text-white shadow-[0_12px_24px_rgba(57,193,187,0.2)] transition hover:opacity-95 sm:w-[420px]"
          >
            ابدأ الآن !
          </Link>
          <div className="flex items-center justify-center gap-4 lg:justify-start">
            <div className="flex -space-x-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#1F3D5A] text-sm font-bold text-white">A</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#2B857E] text-sm font-bold text-white">B</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#31476D] text-sm font-bold text-white">C</span>
            </div>
            <p className="text-base leading-[1.5] text-[#717788]">انضمت إلينا أكثر من 500 مؤسسة حول العالم</p>
          </div>
        </div>

        <div className="order-1 lg:order-1">
          <div className="relative mx-auto w-full max-w-[560px] rounded-[22px] bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
            <img
              src={heroGrid}
              alt="اجتماع مرئي للاختبار"
              className="h-[420px] w-full rounded-2xl object-cover md:h-[500px] lg:h-[542px]"
            />
            <div className="absolute -bottom-7 right-4 flex items-center gap-4 rounded-3xl bg-white px-7 py-4 shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#45C3BC] text-white">✦</div>
              <div>
                <p className="text-4xl font-extrabold leading-none text-[#263247]">2.4M+</p>
                <p className="text-sm text-[#7A8190]">مستفيد من خدماتنا</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

