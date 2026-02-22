type AlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-[#FAEAE8] border-error text-error',
  success: 'bg-[#EDF4EF] border-success text-field-green-darker',
  info: 'bg-[#E8F0F4] border-info text-[#2A6B85]',
  warning: 'bg-[#FBF3E0] border-warning text-[#8B6B20]',
}

export function Alert({ variant = 'error', children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`px-4 py-3 border rounded-sm text-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  )
}
