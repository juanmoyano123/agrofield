type BadgeVariant = 'ars' | 'usd' | 'success' | 'warning' | 'error' | 'info' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  ars: 'bg-parchment text-text-dim border border-border-warm-strong',
  usd: 'bg-[#E8F0F4] text-info border border-[#B8D4E3]',
  success: 'bg-[#EDF4EF] text-field-green border border-[#C5DBC9]',
  warning: 'bg-[#FBF3E0] text-warning border border-[#E8D5A0]',
  error: 'bg-[#FAEAE8] text-error border border-[#E8C0BB]',
  info: 'bg-[#E8F0F4] text-info border border-[#B8D4E3]',
  default: 'bg-parchment text-text-dim border border-border-warm',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
