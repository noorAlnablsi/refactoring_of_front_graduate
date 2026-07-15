import { useTranslation } from 'react-i18next'
import AddRandomBanksModal from '../../AddRandomBanksModal'
import { showAppToast } from '../../../../lib/appToast'
import { EXAM_QUESTION_METHODS } from './examAddQuestionsConstants'

function ExamQuestionsMethodPicker({
  test,
  activeMethod,
  onSelectMethod,
  questionsCount,
  onBack,
  onNext,
  fromBankOpen,
  randomOpen,
  onFromBankClose,
  onRandomClose,
  onFromBankSelected,
  onRandomBanksSelected,
}) {
  const { t } = useTranslation(['exams', 'common'])
  const canContinue = questionsCount > 0

  const handleNext = () => {
    if (!canContinue) {
      showAppToast('wizard.questions.minOneError', 'error', { ns: 'exams' })
      return
    }
    onNext?.()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">{t('wizard.questions.title', { ns: 'exams' })}</h2>
        <p className="mt-1 text-sm text-[#64748B]">{t('wizard.questions.subtitle', { ns: 'exams' })}</p>

        {!canContinue ? (
          <p className="mt-3 rounded-xl bg-[#FFF7ED] px-4 py-3 text-sm font-semibold text-[#C2410C]">
            {t('wizard.questions.emptyHint', { ns: 'exams' })}
          </p>
        ) : (
          <p className="mt-3 rounded-xl bg-[#E8F7F6] px-4 py-3 text-sm font-semibold text-[#2AA8A2]">
            {t('wizard.questions.addedHint', { ns: 'exams', count: questionsCount })}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAM_QUESTION_METHODS.map(({ id, titleKey, descriptionKey, icon: Icon, enabled, comingSoon }) => (
            <button
              key={id}
              type="button"
              disabled={!enabled}
              onClick={() => enabled && onSelectMethod(id)}
              className={`relative rounded-2xl border p-4 text-right transition ${
                enabled
                  ? 'border-[#E5E9EB] hover:border-[#2AA8A2] hover:bg-[#F8FDFC]'
                  : 'cursor-not-allowed border-[#F1F5F9] bg-[#FAFBFC] opacity-70'
              } ${activeMethod === id ? 'border-[#2AA8A2] bg-[#E8F7F6]' : ''}`}
            >
              {comingSoon ? (
                <span className="absolute left-3 top-3 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#94A3B8]">
                  {t('wizard.questions.comingSoon', { ns: 'exams' })}
                </span>
              ) : null}
              <Icon className="h-6 w-6 text-[#2AA8A2]" />
              <p className="mt-3 text-sm font-extrabold text-[#2A3433]">{t(titleKey, { ns: 'exams' })}</p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">{t(descriptionKey, { ns: 'exams' })}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-[#F6F8F9] px-6 py-3 text-sm font-bold text-[#64748B]"
        >
          {t('wizard.questions.previous', { ns: 'exams' })}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          title={!canContinue ? t('wizard.questions.minOneTitle', { ns: 'exams' }) : undefined}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {t('wizard.questions.nextSettings', { ns: 'exams' })}
        </button>
      </div>

      <AddRandomBanksModal
        open={fromBankOpen}
        subjectId={test?.subject_id}
        selectionMode="single"
        onClose={onFromBankClose}
        onBanksSelected={onFromBankSelected}
      />

      <AddRandomBanksModal
        open={randomOpen}
        subjectId={test?.subject_id}
        onClose={onRandomClose}
        onBanksSelected={onRandomBanksSelected}
      />
    </div>
  )
}

export default ExamQuestionsMethodPicker
