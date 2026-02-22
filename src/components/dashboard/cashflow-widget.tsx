import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useCompras } from '../../hooks/use-compras'
import { useTrabajosStore } from '../../stores/contratistas-store'
import { computeCashflow, type PeriodOption } from '../../lib/dashboard-utils'
import { PeriodFilter } from './period-filter'
import { CashflowSummaryCards } from './cashflow-summary-cards'
import { CashflowChart } from './cashflow-chart'
import { EmptyState } from '../ui/empty-state'

type Moneda = 'ARS' | 'USD'

/**
 * CashflowWidget aggregates compras and trabajos to show a monthly cashflow view.
 *
 * Data sources:
 * - Compras: from useCompras() — already loaded by DashboardPage
 * - Trabajos: from useTrabajosStore — loaded by DashboardPage via fetchTrabajos
 *
 * State:
 * - period: selected time period (default: 'this-year')
 * - moneda: selected currency (default: 'ARS')
 */
export function CashflowWidget() {
  const { compras } = useCompras()

  // Select only the trabajos array; useShallow avoids re-render when reference changes
  const trabajos = useTrabajosStore(useShallow((s) => s.trabajos))

  const [period, setPeriod] = useState<PeriodOption>('this-year')
  const [moneda, setMoneda] = useState<Moneda>('ARS')

  // Recompute only when compras, trabajos, period or moneda change
  const summary = useMemo(
    () => computeCashflow(compras, trabajos, period, moneda),
    [compras, trabajos, period, moneda],
  )

  const hasData = summary.mensual.length > 0

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm"
      aria-labelledby="widget-cashflow-title"
    >
      {/* Widget header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border-warm">
        <h2
          id="widget-cashflow-title"
          className="text-base font-semibold text-text-primary tracking-tight"
        >
          Cashflow del Periodo
        </h2>

        {/* Controls: currency toggle */}
        <div
          className="flex rounded-sm border border-border-warm overflow-hidden"
          role="group"
          aria-label="Moneda"
        >
          {(['ARS', 'USD'] as Moneda[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMoneda(m)}
              className={[
                'px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
                moneda === m
                  ? 'bg-field-green text-white'
                  : 'bg-surface text-text-dim hover:bg-parchment',
              ].join(' ')}
              aria-pressed={moneda === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Period filter row */}
      <div className="px-4 sm:px-6 pt-4">
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        {!hasData ? (
          <EmptyState
            icon="💸"
            title="Sin movimientos en el periodo"
            description="No hay compras ni trabajos registrados para el periodo seleccionado. Proba con un rango mas amplio."
          />
        ) : (
          <>
            <CashflowSummaryCards summary={summary} moneda={moneda} />
            <CashflowChart data={summary.mensual} moneda={moneda} />
          </>
        )}
      </div>
    </section>
  )
}
