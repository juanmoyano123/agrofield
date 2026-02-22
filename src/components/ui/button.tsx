import type { ComponentPropsWithRef } from 'react'
import { Spinner } from './spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'default' | 'lg'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-field-green text-white hover:bg-field-green-dark active:bg-field-green-darker disabled:bg-neutral-300 disabled:text-neutral-500',
  secondary: 'bg-earth-brown text-white hover:bg-earth-brown-dark active:bg-earth-brown-darker disabled:bg-neutral-300 disabled:text-neutral-500',
  ghost: 'bg-transparent text-field-green border-2 border-field-green hover:bg-parchment active:bg-surface disabled:border-neutral-300 disabled:text-neutral-300',
  danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800 disabled:bg-neutral-300 disabled:text-neutral-500',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  default: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-6 py-4 text-lg min-h-[56px]',
}

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-sm font-semibold
        transition-colors duration-300
        cursor-pointer disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
