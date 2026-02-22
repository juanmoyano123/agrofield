import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

interface InputProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full px-3 py-3 border rounded-sm bg-surface
            text-base text-text-primary placeholder-text-muted
            hover:border-copper-light
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-parchment disabled:text-text-muted disabled:border-border-warm
            transition-colors duration-300
            min-h-[44px]
            ${error
              ? 'border-error focus:ring-error'
              : 'border-border-warm-strong focus:ring-field-green'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
