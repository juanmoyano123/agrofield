interface OnboardingProgressProps {
  totalSteps: number
  currentStep: number
}

export function OnboardingProgress({ totalSteps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={totalSteps - 1}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <span
          key={index}
          className={`
            rounded-full transition-all duration-300
            ${index === currentStep
              ? 'bg-field-green w-3 h-3'
              : 'bg-border-warm w-2 h-2'
            }
          `}
          aria-label={index === currentStep ? `Paso ${index + 1} (actual)` : `Paso ${index + 1}`}
        />
      ))}
    </div>
  )
}
