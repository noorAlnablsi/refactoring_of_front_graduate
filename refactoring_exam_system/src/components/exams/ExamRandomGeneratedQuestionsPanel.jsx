import { ArrowLeft, ArrowRight, Check, ClipboardList } from 'lucide-react'
import ExamWizardFooter from './ExamWizardFooter'
import { getDifficultyLabel } from '../../lib/questionBanks'

const CHOICE_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'HARD') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (difficulty === 'EASY') return 'bg-[#F1F5F9] text-[#64748B]'
  return 'bg-[#FEF3C7] text-[#D97706]'
}

function GeneratedQuestionCard({ question, index }) {
  const topicName = question.snapshot_topic_name || question.topic_name || 'بدون محور'
  const choices = Array.isArray(question.snapshot_choices)
    ? question.snapshot_choices
    : Array.isArray(question.choices)
      ? question.choices
      : []
  const points = question.snapshot_points ?? question.points ?? 0
  const isTrueFalse = (question.snapshot_type_code || question.type_code) === 'TRUE_FALSE'
  const questionText = question.snapshot_question_text || question.body || ''

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)] ring-1 ring-[#EEF2F4]">
      <div className="flex flex-wrap items-center justify-start gap-2">
        <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
          {topicName}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyBadgeClass(question.snapshot_difficulty || question.difficulty)}`}
        >
          صعوبة: {getDifficultyLabel(question.snapshot_difficulty || question.difficulty)}
        </span>
        <span className="rounded-full bg-[#E8F7F6] px-3 py-1 text-xs font-bold text-[#2AA8A2]">
          {points} {points === 1 ? 'نقطة' : 'نقاط'}
        </span>
      </div>

      <div
        className="mt-5 text-base font-extrabold leading-8 text-[#2A3433]"
        dangerouslySetInnerHTML={{ __html: questionText }}
      />

      {choices.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {choices.map((choice, choiceIndex) => {
            const letter = CHOICE_LETTERS[choiceIndex] || String(choiceIndex + 1)
            const isCorrect = Boolean(choice.is_correct)

            return (
              <li
                key={choice.id || `${index}-${choiceIndex}`}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                  isCorrect
                    ? 'bg-[#E8F7F6] text-[#2AA8A2] ring-1 ring-[#CFECE9]'
                    : 'bg-[#F6F8F9] text-[#64748B]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {!isTrueFalse ? (
                    <span className="text-xs font-bold text-[#94A3B8]">{letter})</span>
                  ) : null}
                  <span dangerouslySetInnerHTML={{ __html: choice.body || choice.text || '' }} />
                </span>
                {isCorrect ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </article>
  )
}

function ExamRandomGeneratedQuestionsPanel({
  questions,
  onBack,
  onSaveDraft,
  onContinue,
  savingDraft = false,
  embedded = false,
  continueLabel = 'التالي — الإعدادات',
  eyebrow = 'بناء المعايير الأكاديمية',
  title = 'مخطط الاختبار (Blueprint)',
  description = 'تم اختيار الأسئلة. راجعها ثم تابع للخطوة التالية.',
  sectionTitle = 'أسئلة الامتحان المختارة',
}) {
  return (
    <div className={`space-y-8 ${embedded ? 'pb-4' : 'pb-4'}`}>
      {!embedded ? (
        <header className="text-right">
          <p className="text-sm font-bold text-[#2AA8A2]">{eyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B] md:text-[15px]">
            {description}
          </p>
        </header>
      ) : null}

      <div>
        <div className="mb-5 flex items-center justify-start gap-2">
          <ClipboardList className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} />
          <h3 className="text-base font-extrabold text-[#2A3433] md:text-lg">{sectionTitle}</h3>
          <span className="mr-2 rounded-full bg-[#E8F7F6] px-2.5 py-0.5 text-xs font-bold text-[#2AA8A2]">
            {questions.length}
          </span>
        </div>

        <div className="space-y-5">
          {questions.map((question, index) => (
            <GeneratedQuestionCard key={question.id || index} question={question} index={index} />
          ))}
        </div>
      </div>

      <ExamWizardFooter className="-mx-1 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B] transition hover:bg-[#EEF2F3]"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={savingDraft || !onSaveDraft}
              className="text-sm font-bold text-[#64748B] transition hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] transition hover:opacity-95"
            >
              {continueLabel}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ExamWizardFooter>
    </div>
  )
}

export default ExamRandomGeneratedQuestionsPanel
