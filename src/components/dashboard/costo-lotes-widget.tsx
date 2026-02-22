/**
 * F-007: CostoLotesWidget — Dashboard widget for cost-per-lote analysis.
 *
 * Improvements over the F-005 basic table:
 *   - Period filter (this-month / 3m / 6m / this-year / all)
 *   - Metric toggle: Total ARS vs $/ha
 *   - Horizontal bar chart (Recharts) showing the selected metric
 *   - Expandable table rows with per-lote line-item breakdown
 *
 * Data flow:
 *   Stores → computeCostosAllLotesByPeriod (dashboard-utils) → rows
 *   buildLineasCosto (imputacion-utils) → lineasPorLote Map (for detail panel)
 */

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../../stores/lotes-store'
import { useEventosStore } from '../../stores/eventos-store'
import { useTrabajosStore } from '../../stores/contratistas-store'
import {
  computeCostosAllLotesByPeriod,
  type PeriodOption,
} from '../../lib/dashboard-utils'
import { buildLineasCosto, type LineaCosto } from '../../lib/imputacion-utils'
import { PeriodFilter } from './period-filter'
import { CostoLotesChart } from './costo-lotes-chart'
import { CostoLotesTable } from './costo-lotes-table'
import { EmptyState } from '../ui/empty-state'

export function CostoLotesWidget() {
  const [period, setPeriod] = useState<PeriodOption>('this-year')
  const [metric, setMetric] = useState<'total' | 'porHa'>('total')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Read store slices with shallow equality to avoid unnecessary re-renders
  const lotes = useLotesStore(
    useShallow(s =>
      s.lotes
        .filter(l => !l.deletedAt)
        .map(l => ({ id: l.id, nombre: l.nombre, hectareas: l.hectareas })),
    ),
  )
  const eventos = useEventosStore(useShallow(s => s.eventos))
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos))

  // Derive period-filtered, sorted rows
  const rows = useMemo(
    () => computeCostosAllLotesByPeriod(lotes, eventos, trabajos, period),
    [lotes, eventos, trabajos, period],
  )

  // Build a Map<loteId, LineaCosto[]> for the detail panels.
  // We use the same filtered slices so the detail panel shows only records
  // within the current period, consistent with the chart and table totals.
  const lineasPorLote = useMemo<Map<string, LineaCosto[]>>(() => {
    const range = period === 'all'
      ? null
      : (() => {
          // Replicate getPeriodRange logic inline to avoid circular dep issues
          const hasta = new Date()
          hasta.setHours(23, 59, 59, 999)
          const desde = new Date()
          switch (period) {
            case 'this-month': desde.setDate(1); break
            case 'last-3': desde.setMonth(desde.getMonth() - 3); break
            case 'last-6': desde.setMonth(desde.getMonth() - 6); break
            case 'this-year': desde.setMonth(0, 1); break
          }
          desde.setHours(0, 0, 0, 0)
          return { desde, hasta }
        })()

    const eventosFiltrados = range
      ? eventos.filter(
          e =>
            !e.deletedAt &&
            e.fecha >= range.desde.toISOString().slice(0, 10) &&
            e.fecha <= range.hasta.toISOString().slice(0, 10),
        )
      : eventos.filter(e => !e.deletedAt)

    const trabajosFiltrados = range
      ? trabajos.filter(
          t =>
            !t.deletedAt &&
            t.fecha >= range.desde.toISOString().slice(0, 10) &&
            t.fecha <= range.hasta.toISOString().slice(0, 10),
        )
      : trabajos.filter(t => !t.deletedAt)

    const map = new Map<string, LineaCosto[]>()
    for (const lote of lotes) {
      map.set(lote.id, buildLineasCosto(lote.id, eventosFiltrados, trabajosFiltrados))
    }
    return map
  }, [lotes, eventos, trabajos, period])

  // Toggle expand/collapse — clicking the same row again collapses it
  function handleToggle(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4 flex flex-col gap-4"
      aria-labelledby="widget-costo-lotes-title"
    >
      {/* Header row: title + metric toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            id="widget-costo-lotes-title"
            className="text-lg font-bold text-text-primary font-display"
          >
            Costos por Lote
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Eventos e insumos + trabajos de contratistas
          </p>
        </div>

        {/* Total / $/ha toggle */}
        <div
          className="flex rounded-sm border border-border-warm overflow-hidden"
          role="group"
          aria-label="Métrica"
        >
          {(['total', 'porHa'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={[
                'px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                metric === m
                  ? 'bg-field-green text-white'
                  : 'bg-surface text-text-dim hover:bg-parchment',
              ].join(' ')}
              aria-pressed={metric === m}
            >
              {m === 'total' ? 'Total' : '$/ha'}
            </button>
          ))}
        </div>
      </div>

      {/* Period filter pills */}
      <PeriodFilter value={period} onChange={setPeriod} />

      {/* Main content: chart + table, or empty state */}
      {rows.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Sin costos registrados"
          description="Registrá eventos con insumos o trabajos de contratistas para ver los costos por lote."
        />
      ) : (
        <>
          {/* Horizontal bar chart */}
          <CostoLotesChart data={rows} metric={metric} />

          {/* Expandable table with per-lote breakdown */}
          <CostoLotesTable
            rows={rows}
            expandedId={expandedId}
            onToggle={handleToggle}
            lineasPorLote={lineasPorLote}
          />
        </>
      )}
    </section>
  )
}
