import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, FlaskConical, Plus } from 'lucide-react'
import { getBankQuestionsCount } from '../../../lib/questionBanks'

const bankCountInputClassName =
  'h-12 w-full rounded-xl bg-[#E8F7F6] px-3 text-center text-lg font-extrabold text-[#2AA8A2] outline-none focus:ring-2 focus:ring-[#2AA8A2]/30'

const topicPercentInputClassName =
  'h-11 w-full rounded-xl border border-[#E5E9EB] bg-white px-3 text-center text-sm font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

const difficultyInputClassName =
  'h-11 w-full rounded-xl border border-[#E5E9EB] bg-white px-3 text-center text-sm font-extrabold text-[#2A3433] outline-none focus:border-[#2AA8A2] focus:ring-2 focus:ring-[#2AA8A2]/20'

function BlueprintBanksEditor({ blueprints, onUpdateBank, onUpdateTopic, onUpdateTopicDifficulty, onAddBanks }) {
  const { t, i18n } = useTranslation('exams')
  const topicOrdinals = useMemo(() => t('topicOrdinals', { returnObjects: true }), [t])

  const formatAvailableQuestionsLabel = (bank) => {
    const count = getBankQuestionsCount(bank)
    if (count == null || Number.isNaN(count)) return t('blueprint.availableQuestionsDash')
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
    return t('blueprint.availableQuestions', { count: count.toLocaleString(locale) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start gap-2">
        <ClipboardList className="h-5 w-5 text-[#2AA8A2]" strokeWidth={2.2} />
        <h3 className="text-base font-extrabold text-[#2A3433] md:text-lg">{t('blueprint.sectionTitle')}</h3>
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
                  {t('blueprint.questionCountLabel')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={bankBlueprint.question_count}
                  onChange={(event) =>
                    onUpdateBank(bankBlueprint.bank_id, { question_count: event.target.value })
                  }
                  className={bankCountInputClassName}
                />
              </div>
            </div>

            {bankBlueprint.topics.length === 0 ? (
              <p className="border-t border-[#F1F5F9] px-6 py-6 text-sm text-[#94A3B8]">{t('blueprint.noTopics')}</p>
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
                            {t('blueprint.topicLabel', {
                              ordinal: topicOrdinals[index] || index + 1,
                            })}
                          </span>{' '}
                          {topic.name}
                        </p>
                      </div>

                      <div className="w-full max-w-[132px] shrink-0">
                        <label className="mb-2 block text-center text-xs font-bold text-[#64748B]">
                          {t('blueprint.percentageLabel')}
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
                              onUpdateTopic(bankBlueprint.bank_id, topic.topic_id, {
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
                        { key: 'easy', label: t('blueprint.easyPercent') },
                        { key: 'medium', label: t('blueprint.mediumPercent') },
                        { key: 'hard', label: t('blueprint.hardPercent') },
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
                              onUpdateTopicDifficulty(
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
        {t('blueprint.addBank')}
      </button>
    </div>
  )
}

export default BlueprintBanksEditor
