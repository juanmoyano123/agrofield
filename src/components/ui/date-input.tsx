import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { Input } from './input'

interface DateInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label: string
  error?: string
}

function getTodayISO(): string {
  // Returns YYYY-MM-DD in local time, not UTC
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, defaultValue, ...props }, ref) => {
    // Only apply the today default when neither value nor defaultValue is explicitly provided,
    // and the component is not being used as a controlled input (value prop absent).
    const resolvedDefault =
      props.value === undefined && defaultValue === undefined
        ? getTodayISO()
        : defaultValue

    return (
      <Input
        ref={ref}
        label={label}
        type="date"
        defaultValue={resolvedDefault}
        error={error}
        {...props}
      />
    )
  }
)

DateInput.displayName = 'DateInput'
