type BadgeVariant = 'ars' | 'usd' | 'success' | 'warning' | 'error' | 'info' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  ars: 'bg-neutral-100 text-neutral-700 border border-neutral-300',
  usd: 'bg-blue-50 text-info border border-blue-200',
  success: 'bg-green-50 text-success border border-green-200',
  warning: 'bg-yellow-50 text-warning border border-yellow-200',
  error: 'bg-red-50 text-error border border-red-200',
  info: 'bg-blue-50 text-info border border-blue-200',
  default: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
