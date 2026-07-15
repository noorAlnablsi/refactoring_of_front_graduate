import { useTranslation } from 'react-i18next'
import { TEST_WIZARD_STEP_KEYS } from '../../constants/tests'

function ExamWizardStepper({ currentStep }) {
  const { t } = useTranslation('exams')

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      {TEST_WIZARD_STEP_KEYS.map((stepKey, index) => {
        const step = index + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        const label = t(`wizard.steps.${stepKey}`)

        return (
          <div key={stepKey} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-[var(--shell-accent)] text-[#0f172a]'
                  : isDone
                    ? 'bg-[var(--shell-accent-bg)] text-[var(--shell-accent)]'
                    : 'bg-[var(--shell-hover)] text-[var(--shell-text-subtle)]'
              }`}
            >
              {step}
            </div>
            <span
              className={`hidden text-sm font-semibold sm:inline ${
                isActive
                  ? 'text-[var(--shell-accent)]'
                  : isDone
                    ? 'text-[var(--shell-text)]'
                    : 'text-[var(--shell-text-subtle)]'
              }`}
            >
              {label}
            </span>
            {step < TEST_WIZARD_STEP_KEYS.length ? (
              <span className="mx-1 hidden h-px w-6 bg-[var(--shell-border)] md:block" />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default ExamWizardStepper
