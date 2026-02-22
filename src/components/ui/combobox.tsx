import { useId } from 'react'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  label: string
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  allowCreate?: boolean
  createLabel?: string
  onCreateRequest?: () => void
  error?: string
  placeholder?: string
  className?: string
}

export function Combobox({
  label,
  options,
  value,
  onChange,
  allowCreate = false,
  createLabel = 'Crear nuevo',
  onCreateRequest,
  error,
  placeholder,
  className = '',
}: ComboboxProps) {
  const uid = useId()
  const inputId = `combobox-${uid}`
  const listId = `datalist-${uid}`
  const errorId = `${inputId}-error`

  // Check if the current value matches any existing option label
  const hasExactMatch = options.some(
    opt => opt.label.toLowerCase() === value.toLowerCase()
  )

  const showCreateButton =
    allowCreate &&
    onCreateRequest &&
    value.trim() !== '' &&
    !hasExactMatch

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-neutral-800">
        {label}
      </label>

      <input
        id={inputId}
        type="text"
        list={listId}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
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
        `}
      />

      <datalist id={listId}>
        {options.map(opt => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>

      {showCreateButton && (
        <button
          type="button"
          onClick={onCreateRequest}
          className="
            self-start text-sm font-semibold text-field-green
            hover:text-field-green-dark underline-offset-2 hover:underline
            transition-colors duration-200
            py-1
          "
        >
          {createLabel}
        </button>
      )}

      {error && (
        <p id={errorId} className="text-sm text-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}
