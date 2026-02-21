type AlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-error text-error',
  success: 'bg-green-50 border-success text-green-800',
  info: 'bg-blue-50 border-info text-blue-800',
  warning: 'bg-yellow-50 border-warning text-yellow-800',
}

export function Alert({ variant = 'error', children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`px-4 py-3 border rounded-md text-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  )
}
