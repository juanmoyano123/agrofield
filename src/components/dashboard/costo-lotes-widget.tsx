/**
 * F-005: CostoLotesWidget — Dashboard widget showing aggregated costs per lote.
 *
 * Displays a table with columns: Lote | Eventos | Contratistas | Total | $/ha
 * Includes a totals footer row.
 * Renders an EmptyState when no costs are registered.
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../../stores/lotes-store'
import { useImputacionGlobal } from '../../hooks/use-imputacion'
import { EmptyState } from '../ui/empty-state'

export function CostoLotesWidget() {
  // Get all active lotes (for display names)
  const lotes = useLotesStore(useShallow(s => s.lotes.filter(l => !l.deletedAt)))

  // Derived cost map from imputacion engine
  const costosMap = useImputacionGlobal()

  // Build table rows — one per lote, only lotes with any cost data
  const rows = useMemo(() => {
    return lotes
      .map(lote => ({
        loteId: lote.id,
        nombre: lote.nombre,
        hectareas: lote.hectareas,
        costo: costosMap.get(lote.id) ?? {
          loteId: lote.id,
          costoEventos: 0,
          costoTrabajos: 0,
          costoTotal: 0,
          costoPorHa: 0,
        },
      }))
      .sort((a, b) => b.costo.costoTotal - a.costo.costoTotal)
  }, [lotes, costosMap])

  // Aggregate totals across all lotes
  const totales = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        costoEventos: acc.costoEventos + row.costo.costoEventos,
        costoTrabajos: acc.costoTrabajos + row.costo.costoTrabajos,
        costoTotal: acc.costoTotal + row.costo.costoTotal,
      }),
      { costoEventos: 0, costoTrabajos: 0, costoTotal: 0 },
    )
  }, [rows])

  const hasCostos = rows.some(r => r.costo.costoTotal > 0)

  function formatARS(value: number): string {
    return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
  }

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm"
      aria-labelledby="widget-costo-lotes-title"
    >
      {/* Widget header */}
      <div className="p-4 sm:p-6 border-b border-border-warm">
        <h2
          id="widget-costo-lotes-title"
          className="text-base font-semibold text-text-primary tracking-tight"
        >
          Costos por Lote
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Costos derivados en tiempo real — eventos e insumos + contratistas
        </p>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {!hasCostos ? (
          <EmptyState
            icon="💰"
            title="Sin costos registrados"
            description="Registrá eventos con insumos o trabajos de contratistas para ver los costos por lote."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Costos por lote">
              <thead>
                <tr className="text-left border-b border-border-warm">
                  <th className="pb-2 pr-4 font-semibold text-text-dim">Lote</th>
                  <th className="pb-2 pr-4 font-semibold text-text-dim text-right">Eventos</th>
                  <th className="pb-2 pr-4 font-semibold text-text-dim text-right">Contratistas</th>
                  <th className="pb-2 pr-4 font-semibold text-text-dim text-right">Total</th>
                  <th className="pb-2 font-semibold text-text-dim text-right">$/ha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row.loteId}
                    className="border-b border-border-warm last:border-0 hover:bg-parchment transition-colors duration-150"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-text-primary">{row.nombre}</span>
                      <span className="text-xs text-text-muted ml-1.5">
                        {row.hectareas.toLocaleString('es-AR')} ha
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-text-dim">
                      {row.costo.costoEventos > 0 ? formatARS(row.costo.costoEventos) : '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-text-dim">
                      {row.costo.costoTrabajos > 0 ? formatARS(row.costo.costoTrabajos) : '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-text-primary">
                      {row.costo.costoTotal > 0 ? formatARS(row.costo.costoTotal) : '—'}
                    </td>
                    <td className="py-2.5 text-right text-text-muted">
                      {row.costo.costoPorHa > 0
                        ? `$${row.costo.costoPorHa.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals footer */}
              <tfoot>
                <tr className="border-t-2 border-border-warm bg-parchment">
                  <td className="pt-3 pr-4 font-bold text-text-primary">Total</td>
                  <td className="pt-3 pr-4 text-right font-semibold text-text-primary">
                    {totales.costoEventos > 0 ? formatARS(totales.costoEventos) : '—'}
                  </td>
                  <td className="pt-3 pr-4 text-right font-semibold text-text-primary">
                    {totales.costoTrabajos > 0 ? formatARS(totales.costoTrabajos) : '—'}
                  </td>
                  <td className="pt-3 pr-4 text-right font-bold text-copper">
                    {totales.costoTotal > 0 ? formatARS(totales.costoTotal) : '—'}
                  </td>
                  <td className="pt-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
