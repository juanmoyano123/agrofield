import { useMemo, useState } from 'react'
import { useCompras } from '../../hooks/use-compras'
import { computeGastoPorProveedor, type PeriodOption } from '../../lib/dashboard-utils'
import { PeriodFilter } from './period-filter'
import { GastoProveedorChart } from './gasto-proveedor-chart'
import { GastoProveedorTable } from './gasto-proveedor-table'
import { EmptyState } from '../ui/empty-state'

type Moneda = 'ARS' | 'USD'

export function GastoProveedorWidget() {
  const { compras } = useCompras()

  const [period, setPeriod] = useState<PeriodOption>('this-year')
  const [moneda, setMoneda] = useState<Moneda>('ARS')

  // Derive aggregated data — recomputed only when compras or period change
  const data = useMemo(
    () => computeGastoPorProveedor(compras, period),
    [compras, period],
  )

  // Total for the selected currency, used by table footer
  const totalGasto = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + (moneda === 'ARS' ? item.totalARS : item.totalUSD),
      0,
    )
  }, [data, moneda])

  const hasCompras = compras.length > 0

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm"
      aria-labelledby="widget-gasto-proveedor-title"
    >
      {/* Widget header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border-warm">
        <h2
          id="widget-gasto-proveedor-title"
          className="text-base font-semibold text-text-primary tracking-tight"
        >
          Gasto por Proveedor
        </h2>

        {hasCompras && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* ARS / USD toggle */}
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
        )}
      </div>

      {/* Period filter row */}
      {hasCompras && (
        <div className="px-4 sm:px-6 pt-4">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {!hasCompras ? (
          <EmptyState
            icon="🛒"
            title="Sin compras registradas"
            description="Registrá tu primera compra para ver estadísticas de gasto por proveedor."
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Sin datos para el período"
            description="No hay compras registradas en el período seleccionado. Probá con un rango más amplio."
          />
        ) : (
          <div className="flex flex-col gap-6">
            <GastoProveedorChart data={data} moneda={moneda} />
            <GastoProveedorTable data={data} totalGasto={totalGasto} moneda={moneda} />
          </div>
        )}
      </div>
    </section>
  )
}
