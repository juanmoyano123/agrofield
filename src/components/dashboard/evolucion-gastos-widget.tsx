import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useCompras } from '../../hooks/use-compras'
import { useTrabajosStore } from '../../stores/contratistas-store'
import {
  computeEvolucionGastos,
  type PeriodOption,
} from '../../lib/dashboard-utils'
import { PeriodFilter } from './period-filter'
import { EvolucionGastosChart } from './evolucion-gastos-chart'
import { EmptyState } from '../ui/empty-state'

type Moneda = 'ARS' | 'USD'

/**
 * EvolucionGastosWidget shows monthly spending broken down by insumo category.
 *
 * This widget is distinct from the Cashflow widget (F-008):
 * - Cashflow shows total egresos vs ingresos (neto).
 * - Evolucion de Gastos shows a category breakdown of spending: semillas,
 *   herbicidas, insecticidas, fertilizantes, otros insumos, and contratistas.
 *
 * Data sources:
 * - Compras + Productos: from useCompras() — loaded by DashboardPage
 * - Trabajos: from useTrabajosStore — loaded by DashboardPage via fetchTrabajos
 *
 * State:
 * - period: selected time period (default: 'this-year')
 * - moneda: selected currency (default: 'ARS')
 * - showCategorias: whether to show per-category stacked areas or a single total (default: false)
 */
export function EvolucionGastosWidget() {
  const { compras, productos } = useCompras()

  // Select only the trabajos array; useShallow avoids re-render when reference changes
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos))

  const [period, setPeriod] = useState<PeriodOption>('this-year')
  const [moneda, setMoneda] = useState<Moneda>('ARS')
  const [showCategorias, setShowCategorias] = useState(false)

  // Recompute only when inputs change
  const summary = useMemo(
    () => computeEvolucionGastos(compras, trabajos, productos, period, moneda),
    [compras, trabajos, productos, period, moneda],
  )

  const hasData = summary.mensual.length > 0

  // Format totals for display
  const formatNum = (v: number) => {
    if (v >= 1_000_000) {
      return '$' + (v / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + 'M'
    }
    if (v >= 1_000) {
      return '$' + (v / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + 'k'
    }
    return '$' + Math.round(v).toLocaleString('es-AR')
  }

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm"
      aria-labelledby="widget-evolucion-gastos-title"
    >
      {/* Widget header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border-warm">
        <h2
          id="widget-evolucion-gastos-title"
          className="text-base font-semibold text-text-primary tracking-tight"
        >
          Evolucion de Gastos
        </h2>

        {/* Controls: currency toggle + category breakdown toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category breakdown toggle button */}
          <button
            type="button"
            onClick={() => setShowCategorias(prev => !prev)}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors duration-150',
              showCategorias
                ? 'bg-field-green text-white border-field-green'
                : 'bg-surface text-text-dim border-border-warm hover:bg-parchment',
            ].join(' ')}
            aria-pressed={showCategorias}
          >
            Por categoria
          </button>

          {/* Currency toggle */}
          <div
            className="flex rounded-sm border border-border-warm overflow-hidden"
            role="group"
            aria-label="Moneda"
          >
            {(['ARS', 'USD'] as Moneda[]).map(m => (
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
      </div>

      {/* Period filter row */}
      <div className="px-4 sm:px-6 pt-4">
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        {!hasData ? (
          <EmptyState
            icon="📊"
            title="Sin gastos en el periodo"
            description="No hay compras ni trabajos registrados para el periodo seleccionado. Proba con un rango mas amplio."
          />
        ) : (
          <>
            {/* Mini stats row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-parchment rounded-sm p-3 border border-border-warm">
                <p className="text-xs text-text-muted mb-1">Total periodo</p>
                <p className="text-lg font-bold text-text-primary tabular-nums">
                  {formatNum(summary.totalPeriodo)}
                </p>
              </div>
              <div className="bg-parchment rounded-sm p-3 border border-border-warm">
                <p className="text-xs text-text-muted mb-1">Promedio / mes</p>
                <p className="text-lg font-bold text-text-primary tabular-nums">
                  {formatNum(summary.promedioMensual)}
                </p>
              </div>
            </div>

            {/* Stacked area chart */}
            <EvolucionGastosChart
              data={summary.mensual}
              promedioMensual={summary.promedioMensual}
              showCategorias={showCategorias}
              moneda={moneda}
            />
          </>
        )}
      </div>
    </section>
  )
}
