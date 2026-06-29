import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDifficultyLabel, getQuestionTypeLabel } from '../../../lib/questionBanks'
import { getSourceTypeLabel, getTestQuestionsCount, getTestTotalPoints } from '../../../lib/testDisplay'
import { getTestName } from '../../../lib/testModel'

function ExamReviewStep({ test, onNext, onBack }) {
  const questions = test?.questions || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = questions[currentIndex]
  const totalPoints = getTestTotalPoints(test)
  const displayQuestionsCount = getTestQuestionsCount(test)

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">مراجعة الامتحان</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          راجع تفاصيل الامتحان والأسئلة قبل النشر.
        </p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#F6F8F9] p-3">
            <dt className="text-xs text-[#94A3B8]">العنوان</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{getTestName(test)}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-3">
            <dt className="text-xs text-[#94A3B8]">عدد الأسئلة</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{displayQuestionsCount}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-3">
            <dt className="text-xs text-[#94A3B8]">مجموع الدرجات</dt>
            <dd className="mt-1 font-bold text-[#2AA8A2]">{totalPoints}</dd>
          </div>
          <div className="rounded-xl bg-[#F6F8F9] p-3">
            <dt className="text-xs text-[#94A3B8]">المدة</dt>
            <dd className="mt-1 font-bold text-[#2A3433]">{test?.duration_minutes || '—'} دقيقة</dd>
          </div>
        </dl>
      </div>

      {questions.length > 0 ? (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-[#2A3433]">
              معاينة السؤال {currentIndex + 1} من {questions.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="rounded-lg bg-[#F6F8F9] p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={currentIndex >= questions.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="rounded-lg bg-[#F6F8F9] p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {current ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#64748B]">
                <span className="rounded-full bg-[#E8F7F6] px-2 py-0.5 text-[#2AA8A2]">
                  {getQuestionTypeLabel(current.snapshot_type_code)}
                </span>
                <span>{getDifficultyLabel(current.snapshot_difficulty)}</span>
                <span>· {current.snapshot_points} درجة</span>
                <span>· {getSourceTypeLabel(current.source_type)}</span>
              </div>
              <div
                className="prose prose-sm max-w-none text-[#374151]"
                dangerouslySetInnerHTML={{ __html: current.snapshot_question_text || '' }}
              />
              {Array.isArray(current.snapshot_choices) && current.snapshot_choices.length > 0 ? (
                <ul className="space-y-2">
                  {current.snapshot_choices.map((choice, idx) => (
                    <li
                      key={choice.id || idx}
                      className={`rounded-xl px-4 py-2 text-sm ${
                        choice.is_correct ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#F6F8F9] text-[#64748B]'
                      }`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: choice.body || choice.text || '' }} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white"
        >
          التالي — النشر
        </button>
      </div>
    </div>
  )
}

export default ExamReviewStep
