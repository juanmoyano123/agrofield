interface OnboardingResumeBannerProps {
  currentStep: number
  onResume: () => void
  onDismiss: () => void
}

export function OnboardingResumeBanner({ currentStep, onResume, onDismiss }: OnboardingResumeBannerProps) {
  return (
    <div className="
      fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2
      z-50 w-[calc(100%-2rem)] max-w-md
      bg-surface border border-border-warm rounded-sm shadow-warm
      flex items-center justify-between gap-3
      px-4 py-3
    ">
      <p className="text-sm text-text-dim leading-snug">
        Continuá el tutorial desde el paso{' '}
        <span className="font-medium text-text-primary">{currentStep + 1}</span>
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onResume}
          className="
            px-3 py-1.5 rounded-sm
            bg-field-green text-white text-xs font-medium
            hover:bg-field-green/90
            transition-all duration-300
            min-h-[36px]
          "
        >
          Retomar
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="
            px-2 py-1.5
            text-text-muted text-xs
            hover:text-text-dim
            transition-colors duration-300
            min-h-[36px]
          "
          aria-label="Cerrar banner de tutorial"
        >
          X
        </button>
      </div>
    </div>
  )
}
