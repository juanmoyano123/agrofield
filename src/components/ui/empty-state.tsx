interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        px-6 py-16 rounded-sm border border-border-warm bg-surface
        ${className}
      `}
    >
      <span className="text-5xl mb-4" role="img" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="
            px-4 py-2 text-sm font-semibold rounded-sm
            bg-field-green text-white
            hover:bg-field-green-dark
            transition-colors duration-200
            min-h-[44px]
          "
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
