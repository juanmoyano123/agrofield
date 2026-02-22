import { useState } from 'react'
import type { CashflowSummary } from '../../lib/dashboard-utils'

interface CashflowSummaryCardsProps {
  summary: CashflowSummary
  moneda: 'ARS' | 'USD'
}

function formatCurrency(value: number, moneda: 'ARS' | 'USD'): string {
  const prefix = moneda === 'ARS' ? '$' : 'USD '
  return prefix + Math.abs(value).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export function CashflowSummaryCards({ summary, moneda }: CashflowSummaryCardsProps) {
  // Toggle to expand the egresos breakdown (insumos vs servicios)
  const [egresosExpanded, setEgresosExpanded] = useState(false)

  const { totalIngresos, totalEgresosCompras, totalEgresosTrabajos, totalEgresos, saldoNeto } = summary

  const isNetoPositive = saldoNeto >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Ingresos card — placeholder until F-012 */}
      <div className="bg-parchment rounded-sm border border-border-warm p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Ingresos
          </span>
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            Proximamente
          </span>
        </div>
        <p className="text-2xl font-bold text-text-dim mt-1">
          {formatCurrency(totalIngresos, moneda)}
        </p>
        <p className="text-xs text-text-muted">Ventas no disponibles aun</p>
      </div>

      {/* Egresos card — expandible breakdown */}
      <div className="bg-parchment rounded-sm border border-border-warm p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Egresos
          </span>
          {/* Expand/collapse button for breakdown */}
          <button
            type="button"
            onClick={() => setEgresosExpanded((prev) => !prev)}
            className="text-[10px] font-semibold text-text-dim hover:text-text-primary transition-colors duration-150 underline underline-offset-2"
            aria-expanded={egresosExpanded}
            aria-controls="egresos-breakdown"
          >
            {egresosExpanded ? 'Ocultar' : 'Ver desglose'}
          </button>
        </div>
        <p className="text-2xl font-bold text-copper mt-1">
          {formatCurrency(totalEgresos, moneda)}
        </p>

        {/* Expandable breakdown: insumos vs servicios */}
        {egresosExpanded && (
          <div
            id="egresos-breakdown"
            className="mt-2 pt-2 border-t border-border-warm flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Insumos (compras)</span>
              <span className="text-xs font-semibold text-text-primary">
                {formatCurrency(totalEgresosCompras, moneda)}
              </span>
            </div>
            {moneda === 'ARS' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Servicios (contratistas)</span>
                <span className="text-xs font-semibold text-text-primary">
                  {formatCurrency(totalEgresosTrabajos, moneda)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saldo Neto card */}
      <div
        className={[
          'rounded-sm border p-4 flex flex-col gap-1',
          isNetoPositive
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200',
        ].join(' ')}
      >
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Saldo Neto
        </span>
        <p
          className={[
            'text-2xl font-bold mt-1',
            isNetoPositive ? 'text-field-green' : 'text-red-600',
          ].join(' ')}
        >
          {isNetoPositive ? '' : '-'}
          {formatCurrency(saldoNeto, moneda)}
        </p>
        <p className="text-xs text-text-muted">
          {isNetoPositive ? 'Resultado positivo' : 'Resultado negativo'}
        </p>
      </div>
    </div>
  )
}
