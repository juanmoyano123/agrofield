import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  label: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, placeholder, className = '', ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${selectId}-error`

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full px-3 py-3 border rounded-sm bg-surface
            text-base text-text-primary
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
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
