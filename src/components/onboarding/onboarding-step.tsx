interface OnboardingStepProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function OnboardingStep({ icon, title, description, actionLabel, onAction }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6 px-2">
      <span className="text-5xl leading-none select-none" role="img" aria-hidden="true">
        {icon}
      </span>
      <h2 className="font-display font-semibold text-xl text-text-primary leading-snug">
        {title}
      </h2>
      <p className="text-sm text-text-dim leading-relaxed max-w-xs">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="
            mt-2 px-5 py-2.5 rounded-sm
            bg-field-green text-white text-sm font-medium
            hover:bg-field-green/90
            transition-all duration-300
            min-h-[44px]
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
