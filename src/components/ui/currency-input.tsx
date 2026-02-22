import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

interface CurrencyInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label: string
  error?: string
  currencySymbol?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, id, currencySymbol = '$', className = '', ...props }, ref) => {
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
        <div className="relative flex items-center">
          <span
            className="
              absolute left-3 text-sm font-semibold text-neutral-500
              pointer-events-none select-none
            "
            aria-hidden="true"
          >
            {currencySymbol}
          </span>
          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={`
              w-full pl-8 pr-3 py-3 border rounded-md
              text-base text-neutral-900 placeholder-neutral-500
              hover:border-neutral-400
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-neutral-100 disabled:text-neutral-500 disabled:border-neutral-200
              transition-colors duration-200
              min-h-[44px]
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${error
                ? 'border-error focus:ring-error'
                : 'border-neutral-300 focus:ring-field-green'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
