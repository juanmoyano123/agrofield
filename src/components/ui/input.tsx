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
          className="text-sm font-semibold text-neutral-800"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full px-3 py-3 border rounded-md
            text-base text-neutral-900 placeholder-neutral-500
            hover:border-neutral-400
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-neutral-100 disabled:text-neutral-500 disabled:border-neutral-200
            transition-colors duration-200
            min-h-[44px]
            ${error
              ? 'border-error focus:ring-error'
              : 'border-neutral-300 focus:ring-field-green'
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
