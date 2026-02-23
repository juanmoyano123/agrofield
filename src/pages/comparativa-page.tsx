/**
 * F-027: ComparativaPage — Dedicated page for cross-campaña comparison.
 *
 * Layout:
 *   1. Header (title + description)
 *   2. CampanaSelector (create/manage/select campañas)
 *   3. [If <2 selected] Empty state message
 *   4. [If 2+ selected] KPI cards + Costos chart + Categorías chart + Table
 *
 * Route: /comparativa (propietario | administrador only)
 */

import { useState } from 'react'
import { GitCompareArrows } from 'lucide-react'
import { useComparativa } from '../hooks/use-comparativa'
import { CampanaSelector } from '../components/comparativa/campana-selector'
import { ComparativaKpiCards } from '../components/comparativa/comparativa-kpi-cards'
import { ComparativaCostosChart } from '../components/comparativa/comparativa-costos-chart'
import { ComparativaCategoriasChart } from '../components/comparativa/comparativa-categorias-chart'
import { ComparativaTable } from '../components/comparativa/comparativa-table'
import type { Campana } from '../types'

const MAX_SELECTED = 4

export function ComparativaPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [metric, setMetric] = useState<'total' | 'porHa'>('total')

  const { campanas, computedData, eventos, trabajos } = useComparativa(selectedIds)

  function handleToggle(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, id]
    })
  }

  // Selected campañas in order (for categorías chart)
  const selectedCampanas: Campana[] = selectedIds
    .map(id => campanas.find(c => c.id === id))
    .filter((c): c is Campana => c !== undefined)

  const hasEnoughForComparison = selectedIds.length >= 2

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompareArrows size={20} className="text-field-green" />
          <h1 className="text-2xl font-bold text-text-primary font-display">
            Comparativa de Campañas
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          Compará métricas financieras entre distintas temporadas productivas.
          Definí rangos de fechas como campañas y analizalas lado a lado.
        </p>
      </div>

      {/* Campaña selector */}
      <CampanaSelector selectedIds={selectedIds} onToggle={handleToggle} />

      {/* Guard: need at least 1 selection */}
      {campanas.length === 0 && (
        <div className="bg-surface rounded-sm border border-border-warm p-8 text-center">
          <span className="text-5xl mb-4 block" role="img" aria-hidden="true">📅</span>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Creá tu primera campaña
          </h2>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Una campaña es un rango de fechas que define una temporada productiva.
            Ejemplo: "Campaña 2024/25" de Sep 2024 a Abr 2025.
          </p>
        </div>
      )}

      {/* Message when only 1 campaña selected */}
      {campanas.length > 0 && selectedIds.length === 1 && (
        <>
          {/* Show single-campaña KPI */}
          <ComparativaKpiCards data={computedData} />
          <div className="bg-parchment/50 border border-border-warm rounded-sm px-4 py-3 text-sm text-text-muted text-center">
            Seleccioná al menos 2 campañas para ver los gráficos comparativos
          </div>
        </>
      )}

      {/* Message when 0 selected but campañas exist */}
      {campanas.length > 0 && selectedIds.length === 0 && (
        <div className="bg-parchment/50 border border-border-warm rounded-sm px-4 py-8 text-center">
          <p className="text-sm text-text-muted">
            Seleccioná al menos 1 campaña usando los checkboxes del panel superior.
          </p>
        </div>
      )}

      {/* Full comparison view */}
      {hasEnoughForComparison && (
        <>
          {/* KPI Cards */}
          <ComparativaKpiCards data={computedData} />

          {/* Costos per lote chart */}
          <ComparativaCostosChart
            data={computedData}
            metric={metric}
            onMetricChange={setMetric}
          />

          {/* Categorías chart */}
          <ComparativaCategoriasChart
            campanas={selectedCampanas}
            eventos={eventos}
            trabajos={trabajos}
          />

          {/* Detailed table */}
          <ComparativaTable data={computedData} />
        </>
      )}
    </div>
  )
}
