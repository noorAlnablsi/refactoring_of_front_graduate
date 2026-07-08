import { BookOpen, FileSpreadsheet, PenLine, Shuffle, Sparkles } from 'lucide-react'

export const EXAM_QUESTION_METHODS = [
  {
    id: 'from-bank',
    title: 'من بنك الأسئلة',
    description: 'اختر أسئلة محددة من بنك واحد',
    icon: BookOpen,
    enabled: true,
  },
  {
    id: 'random',
    title: 'عشوائي من البنوك',
    description: 'اختر أسئلة عشوائية من بنك أو أكثر',
    icon: Shuffle,
    enabled: true,
  },
  {
    id: 'manual',
    title: 'إنشاء يدوي',
    description: 'أنشئ أسئلة جديدة خاصة بهذا الامتحان',
    icon: PenLine,
    enabled: true,
  },
  {
    id: 'csv',
    title: 'استيراد CSV',
    description: 'قريباً — استيراد أسئلة من ملف',
    icon: FileSpreadsheet,
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'ai',
    title: 'توليد بالذكاء الاصطناعي',
    description: 'قريباً — توليد أسئلة تلقائياً',
    icon: Sparkles,
    enabled: false,
    comingSoon: true,
  },
]

export const EXAM_QUESTIONS_REVIEW_COPY = {
  random: {
    eyebrow: 'بناء المعايير الأكاديمية',
    title: 'مخطط الاختبار (Blueprint)',
    description: 'تم اختيار الأسئلة عشوائياً وفق النسب التي حددتها. راجعها ثم تابع.',
    sectionTitle: 'تكوين بنوك الأسئلة المختارة',
  },
  'from-bank': {
    eyebrow: 'من بنك الأسئلة',
    title: 'أسئلة الامتحان المختارة',
    description: 'راجع الأسئلة التي اخترتها من البنك قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
  manual: {
    eyebrow: 'إنشاء يدوي',
    title: 'أسئلة الامتحان',
    description: 'راجع الأسئلة التي أنشأتها يدوياً قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
  exam: {
    eyebrow: 'إضافة الأسئلة',
    title: 'أسئلة الامتحان',
    description: 'راجع أسئلة الامتحان قبل المتابعة إلى الإعدادات.',
    sectionTitle: 'الأسئلة المضافة للامتحان',
  },
}
