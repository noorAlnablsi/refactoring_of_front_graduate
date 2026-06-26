import { TEST_WIZARD_STEP_LABELS } from '../../constants/tests'

function ExamWizardStepper({ currentStep }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      {TEST_WIZARD_STEP_LABELS.map((label, index) => {
        const step = index + 1
        const isActive = step === currentStep
        const isDone = step < currentStep

        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-[#2AA8A2] text-white'
                  : isDone
                    ? 'bg-[#E8F7F6] text-[#2AA8A2]'
                    : 'bg-[#F1F5F9] text-[#94A3B8]'
              }`}
            >
              {step}
            </div>
            <span
              className={`hidden text-sm font-semibold sm:inline ${
                isActive ? 'text-[#2AA8A2]' : isDone ? 'text-[#2A3433]' : 'text-[#94A3B8]'
              }`}
            >
              {label}
            </span>
            {step < TEST_WIZARD_STEP_LABELS.length ? (
              <span className="mx-1 hidden h-px w-6 bg-[#E5E9EB] md:block" />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default ExamWizardStepper
