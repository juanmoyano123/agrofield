import type { PeriodOption } from '../../lib/dashboard-utils'

interface PeriodFilterProps {
  value: PeriodOption
  onChange: (p: PeriodOption) => void
}

const OPTIONS: { label: string; value: PeriodOption }[] = [
  { label: 'Este mes', value: 'this-month' },
  { label: '3 meses', value: 'last-3' },
  { label: '6 meses', value: 'last-6' },
  { label: 'Este año', value: 'this-year' },
  { label: 'Todo', value: 'all' },
]

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro de período">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors duration-150',
              isActive
                ? 'bg-field-green text-white border-field-green'
                : 'bg-surface text-text-dim border-border-warm hover:bg-parchment',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
