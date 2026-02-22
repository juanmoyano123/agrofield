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
          className="text-sm font-semibold text-neutral-800"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full px-3 py-3 border rounded-md
            text-base text-neutral-900 bg-white
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
