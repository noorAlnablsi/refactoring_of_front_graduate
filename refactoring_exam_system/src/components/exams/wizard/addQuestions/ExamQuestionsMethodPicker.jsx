import AddRandomBanksModal from '../../AddRandomBanksModal'
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
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#E5E9EB]">
        <h2 className="text-xl font-extrabold text-[#2A3433]">إضافة الأسئلة</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          اختر طريقة إضافة الأسئلة. يجب إضافة سؤال واحد على الأقل للمتابعة.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAM_QUESTION_METHODS.map(({ id, title, description, icon: Icon, enabled, comingSoon }) => (
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
                  قريباً
                </span>
              ) : null}
              <Icon className="h-6 w-6 text-[#2AA8A2]" />
              <p className="mt-3 text-sm font-extrabold text-[#2A3433]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
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
          السابق
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={questionsCount < 1}
          className="rounded-xl bg-[#2AA8A2] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          التالي — الإعدادات
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
