import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  FlaskConical,
  Plus,
  X,
} from 'lucide-react'
import {
  buildRandomFromBanksPayload,
  createDefaultBankBlueprint,
  extractTopicsFromQuestions,
  getBlueprintTotalQuestions,
  getActiveBlueprintTopics,
  mapSubjectTopicsToBlueprint,
  resolveBankSubjectId,
  validateBlueprintHealth,
} from '../../lib/examBlueprint'
import { getBankQuestionsCount } from '../../lib/questionBanks'
import { getQuestionBankQuestions } from '../../services/questionBanks.service'
import { getSubjectTopics } from '../../services/subjects.service'
import { addRandomQuestionsFromBanks } from '../../services/tests.service'
import { useToastStore } from '../../store/toastStore'
import ExamSummarySidebar from './ExamSummarySidebar'

const TOPIC_ORDINALS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
]

const bankCountInputClassName =
  'h-12 w-full rounded-xl bg-[#E8F7F6] px-3 text-center text-lg font-extrabold text-[#2AA8A2] outline-none focus:ring-2 focus:ring-[#2AA8A2]/30'

const topicPercentInputClassName =
  'h-11 w-full rounded-xl border border-[#E5E9EB] bg-white px-3 text-center text-sm font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

const difficultyInputClassName =
  'h-11 w-full rounded-xl border border-[#E5E9EB] bg-white px-3 text-center text-sm font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

function formatAvailableQuestionsLabel(bank) {
  const count = getBankQuestionsCount(bank)
  if (count == null || Number.isNaN(count)) return 'إجمالي الأسئلة المتاحة: —'
  return `إجمالي الأسئلة المتاحة: ${count.toLocaleString('ar-EG')} سؤال`
}

function HealthRow({ label, ok }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          ok ? 'bg-[#E8F7F6] text-[#2AA8A2]' : 'bg-[#FEE2E2] text-[#EF4444]'
        }`}
      >
        {ok ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <X className="h-4 w-4" strokeWidth={2.5} />}
      </span>
    </div>
  )
}

async function loadBankTopics(bank) {
  const questionsResult = await getQuestionBankQuestions(bank.id).catch(() => ({ questions: [] }))
  const fromQuestions = extractTopicsFromQuestions(questionsResult.questions || [])

  if (fromQuestions.length > 0) return fromQuestions

  const subjectId = resolveBankSubjectId(bank)
  if (!subjectId) return []

  const topicsData = await getSubjectTopics(subjectId).catch(() => ({ topics: [] }))
  return mapSubjectTopicsToBlueprint(topicsData.topics || topicsData || [])
}

function ExamRandomBlueprintPanel({
  test,
  testId,
  banks,
  initialBlueprints = null,
  onBack,
  onAddBanks,
  onSaveDraft,
  onSuccess,
  savingDraft = false,
}) {
  const showToast = useToastStore((s) => s.showToast)
  const [blueprints, setBlueprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const syncBlueprints = async () => {
      setLoading(true)
      try {
        const loaded = await Promise.all(
          banks.map(async (bank) => {
            const topics = await loadBankTopics(bank)
            return createDefaultBankBlueprint(bank, topics)
          }),
        )

        if (cancelled) return

        setBlueprints((prev) => {
          const previousById = new Map(prev.map((item) => [item.bank_id, item]))
          const restoredById = new Map((initialBlueprints || []).map((item) => [item.bank_id, item]))
          return loaded.map(
            (item) => restoredById.get(item.bank_id) ?? previousById.get(item.bank_id) ?? item,
          )
        })
      } catch (err) {
        if (!cancelled) showToast(err.message || 'تعذر تحميل محاور البنوك', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    syncBlueprints()

    return () => {
      cancelled = true
    }
  }, [banks, initialBlueprints, showToast])

  const health = useMemo(() => validateBlueprintHealth(blueprints), [blueprints])
  const blueprintQuestionsCount = useMemo(
    () => getBlueprintTotalQuestions(blueprints),
    [blueprints],
  )

  const updateBank = (bankId, patch) => {
    setBlueprints((prev) =>
      prev.map((item) => (item.bank_id === bankId ? { ...item, ...patch } : item)),
    )
  }

  const updateTopic = (bankId, topicId, patch) => {
    setBlueprints((prev) =>
      prev.map((bank) => {
        if (bank.bank_id !== bankId) return bank
        return {
          ...bank,
          topics: bank.topics.map((topic) =>
            topic.topic_id === topicId ? { ...topic, ...patch } : topic,
          ),
        }
      }),
    )
  }

  const updateTopicDifficulty = (bankId, topicId, key, value) => {
    setBlueprints((prev) =>
      prev.map((bank) => {
        if (bank.bank_id !== bankId) return bank
        return {
          ...bank,
          topics: bank.topics.map((topic) => {
            if (topic.topic_id !== topicId) return topic
            return {
              ...topic,
              difficulty: { ...topic.difficulty, [key]: value },
            }
          }),
        }
      }),
    )
  }

  const handleGenerate = async () => {
    if (!health.isValid) {
      showToast('أكمل توزيع المحاور ومستويات الصعوبة قبل التوليد', 'error')
      return
    }

    const banksWithoutActiveTopics = blueprints.filter(
      (bank) => getActiveBlueprintTopics(bank.topics).length === 0,
    )
    if (banksWithoutActiveTopics.length > 0) {
      showToast('حدد محوراً واحداً على الأقل لكل بنك بنسبة أكبر من صفر', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = buildRandomFromBanksPayload(blueprints)
      const result = await addRandomQuestionsFromBanks(testId, payload)
      const added = result?.count ?? health.totalQuestions
      showToast(`تم توليد ${added} سؤال بنجاح`)
      onSuccess?.(result?.questions || [])
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-white ring-1 ring-[#E5E9EB]">
        <p className="text-sm text-[#94A3B8]">جاري تحميل مخطط الاختبار...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-4">
      <header className="text-right">
        <p className="text-sm font-bold text-[#2AA8A2]">بناء المعايير الأكاديمية</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#2A3433] md:text-[32px]">
          مخطط الاختبار (Blueprint)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#64748B] md:text-[15px]">
          قم بتحديد توزيع الأسئلة عبر بنوك المعرفة المختلفة. سيتم حساب الأوزان النسبية وتوزيع مستويات
          الصعوبة بشكل آلي لضمان توازن التقييم.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="flex items-center justify-start gap-2">
            <ClipboardList className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} />
            <h3 className="text-base font-extrabold text-[#2A3433] md:text-lg">
              تكوين بنوك الأسئلة المختارة
            </h3>
          </div>

          {blueprints.map((bankBlueprint) => {
            const bank = bankBlueprint.bank

            return (
              <section
                key={bankBlueprint.bank_id}
                className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)] ring-1 ring-[#EEF2F4]"
              >
                <div className="flex flex-wrap items-start justify-between gap-5 px-6 py-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7F6] text-[#2AA8A2]">
                      <FlaskConical className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <div className="text-right">
                      <h4 className="text-lg font-extrabold text-[#2A3433]">{bank.title}</h4>
                      <p className="mt-1 text-sm font-semibold text-[#2AA8A2]">
                        {formatAvailableQuestionsLabel(bank)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full max-w-[148px] shrink-0">
                    <label className="mb-2 block text-center text-xs font-bold text-[#64748B]">
                      عدد الأسئلة
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bankBlueprint.question_count}
                      onChange={(event) =>
                        updateBank(bankBlueprint.bank_id, { question_count: event.target.value })
                      }
                      className={bankCountInputClassName}
                    />
                  </div>
                </div>

                {bankBlueprint.topics.length === 0 ? (
                  <p className="border-t border-[#F1F5F9] px-6 py-6 text-sm text-[#94A3B8]">
                    لا توجد محاور في هذا البنك. أزل البنك أو اختر بنكاً يحتوي أسئلة بمحاور.
                  </p>
                ) : (
                  <div className="space-y-4 border-t border-[#F1F5F9] px-6 py-5">
                    {bankBlueprint.topics.map((topic, index) => (
                      <div
                        key={topic.topic_id}
                        className="rounded-2xl bg-[#F3FBFA] p-5 ring-1 ring-[#E3F3F1]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 text-right">
                            <p className="text-sm font-extrabold leading-7 text-[#2A3433]">
                              <span className="text-[#64748B]">
                                الموضوع {TOPIC_ORDINALS[index] || index + 1}:
                              </span>{' '}
                              {topic.name}
                            </p>
                          </div>

                          <div className="w-full max-w-[132px] shrink-0">
                            <label className="mb-2 block text-center text-xs font-bold text-[#64748B]">
                              النسبة المئوية
                            </label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#94A3B8]">
                                %
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={topic.percentage}
                                onChange={(event) =>
                                  updateTopic(bankBlueprint.bank_id, topic.topic_id, {
                                    percentage: event.target.value,
                                  })
                                }
                                className={`${topicPercentInputClassName} pl-8`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          {[
                            { key: 'easy', label: 'سهل (%)' },
                            { key: 'medium', label: 'متوسط (%)' },
                            { key: 'hard', label: 'صعب (%)' },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="mb-2 block text-center text-xs font-bold text-[#64748B]">
                                {label}
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={topic.difficulty[key]}
                                onChange={(event) =>
                                  updateTopicDifficulty(
                                    bankBlueprint.bank_id,
                                    topic.topic_id,
                                    key,
                                    event.target.value,
                                  )
                                }
                                className={difficultyInputClassName}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          <button
            type="button"
            onClick={onAddBanks}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#B8E8E4] bg-[#F8FDFC] px-6 py-10 text-sm font-bold text-[#2AA8A2] transition hover:border-[#2AA8A2] hover:bg-[#EEFAF9]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
            إضافة بنك أسئلة إضافي
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] ring-1 ring-[#E5E9EB]">
            <div className="flex items-center justify-start gap-2">
              <BarChart3 className="h-4 w-4 text-[#2AA8A2]" strokeWidth={2.2} />
              <h3 className="text-sm font-extrabold text-[#2A3433]">مؤشرات صحة المخطط</h3>
            </div>
            <div className="mt-5 space-y-4">
              <HealthRow label="توزيع الأوزان مكتمل (%100)" ok={health.weightsValid} />
              <HealthRow label="توازن مستويات الصعوبة (%100)" ok={health.difficultyValid} />
            </div>
          </div>

          <ExamSummarySidebar
            test={test}
            questionsCountOverride={blueprintQuestionsCount}
            showStepIndicator={false}
          />
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 mt-2 rounded-2xl border border-[#E5E9EB] bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
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
              onClick={() => onSaveDraft?.(blueprints)}
              disabled={savingDraft}
              className="text-sm font-bold text-[#64748B] transition hover:text-[#374151] disabled:opacity-50"
            >
              {savingDraft ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={submitting || !health.isValid}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2AA8A2] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(42,168,162,0.28)] transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'جاري التوليد...' : 'توليد الاختبار'}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamRandomBlueprintPanel
