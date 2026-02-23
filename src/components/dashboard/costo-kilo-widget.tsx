/**
 * F-026: CostoKiloWidget — Dashboard widget for costo por kilo ganadero.
 *
 * Shows cost efficiency metrics for all ganaderia lotes:
 *   - $/kg  → cost per kg of production
 *   - $/cab → cost per head
 *   - Total → absolute ARS cost
 *
 * Data flow:
 *   RodeoStore (all events) → computeCostoKiloAllLotes → CostoKiloLote[]
 *   buildCostoKiloDesglose → desglosePorLote Map (for detail panels)
 */

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../../stores/lotes-store'
import { useRodeoStore } from '../../stores/rodeo-store'
import {
  computeCostoKiloAllLotes,
  buildCostoKiloDesglose,
  type CostoKiloDesglose,
} from '../../lib/costo-kilo-utils'
import { CostoKiloChart } from './costo-kilo-chart'
import { CostoKiloTable } from './costo-kilo-table'
import { EmptyState } from '../ui/empty-state'

type MetricOption = 'porKg' | 'porCab' | 'total'

const METRIC_OPTIONS: { label: string; value: MetricOption }[] = [
  { label: '$/kg', value: 'porKg' },
  { label: '$/cab', value: 'porCab' },
  { label: 'Total', value: 'total' },
]

export function CostoKiloWidget() {
  const [metric, setMetric] = useState<MetricOption>('porKg')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const lotes = useLotesStore(
    useShallow(s =>
      s.lotes
        .filter(l => !l.deletedAt && l.actividad === 'ganaderia')
        .map(l => ({ id: l.id, nombre: l.nombre, actividad: l.actividad, cabezas: l.cabezas })),
    ),
  )
  const eventosRodeo = useRodeoStore(useShallow(s => s.eventos))

  const rows = useMemo(
    () => computeCostoKiloAllLotes(lotes, eventosRodeo),
    [lotes, eventosRodeo],
  )

  // Build desglose per lote for the detail panels
  const desglosePorLote = useMemo<Map<string, CostoKiloDesglose[]>>(() => {
    const map = new Map<string, CostoKiloDesglose[]>()
    for (const lote of lotes) {
      map.set(lote.id, buildCostoKiloDesglose(lote.id, eventosRodeo))
    }
    return map
  }, [lotes, eventosRodeo])

  function handleToggle(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4 flex flex-col gap-4"
      aria-labelledby="widget-costo-kilo-title"
    >
      {/* Header row: title + metric toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            id="widget-costo-kilo-title"
            className="text-lg font-bold text-text-primary font-display"
          >
            Costo por Kilo Ganadero
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Eficiencia de producción por lote ganadero
          </p>
        </div>

        {/* Metric toggle: $/kg | $/cab | Total */}
        <div
          className="flex rounded-sm border border-border-warm overflow-hidden"
          role="group"
          aria-label="Métrica"
        >
          {METRIC_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMetric(opt.value)}
              className={[
                'px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                metric === opt.value
                  ? 'bg-field-green text-white'
                  : 'bg-surface text-text-dim hover:bg-parchment',
              ].join(' ')}
              aria-pressed={metric === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {rows.length === 0 ? (
        <EmptyState
          icon="🐄"
          title="Sin datos ganaderos"
          description="Registrá eventos de rodeo en lotes ganaderos para ver el costo por kilo."
        />
      ) : (
        <>
          {/* Horizontal bar chart */}
          <CostoKiloChart data={rows} metric={metric} />

          {/* Expandable table */}
          <CostoKiloTable
            rows={rows}
            expandedId={expandedId}
            onToggle={handleToggle}
            desglosePorLote={desglosePorLote}
          />
        </>
      )}
    </section>
  )
}
