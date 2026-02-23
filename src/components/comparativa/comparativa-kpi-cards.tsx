/**
 * F-027: ComparativaKpiCards — KPI summary cards per selected campaña.
 *
 * Shows: Costo total, $/ha promedio, Lotes activos.
 * For the 2nd+ campañas, shows % variation vs the first (reference) campaña.
 * Positive variation (more cost) = red, negative (less cost) = green.
 */

import type { ComparativaCampanaData } from '../../lib/comparativa-utils'
import { getCampanaColor } from '../../lib/comparativa-utils'

interface ComparativaKpiCardsProps {
  data: ComparativaCampanaData[]
}

function formatARS(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatVariation(base: number, current: number): { text: string; positive: boolean } | null {
  if (base === 0) return null
  const pct = ((current - base) / base) * 100
  const text = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  return { text, positive: pct > 0 }
}

export function ComparativaKpiCards({ data }: ComparativaKpiCardsProps) {
  if (data.length === 0) return null

  const referencia = data[0]!

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {data.map((campana, index) => {
        const color = getCampanaColor(index)
        const lotesActivos = campana.costosPorLote.filter(r => r.costoTotal > 0).length

        // Variations vs reference (only for 2nd+ campañas)
        const varTotal = index > 0 ? formatVariation(referencia.totalGeneral, campana.totalGeneral) : null
        const varHa = index > 0 ? formatVariation(referencia.promedioHa, campana.promedioHa) : null

        return (
          <div
            key={campana.campanaId}
            className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4"
            style={{ borderTopColor: color, borderTopWidth: '3px' }}
          >
            {/* Campaña name */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide truncate">
                {campana.campanaNombre}
              </p>
            </div>

            {/* Costo total */}
            <div className="mb-2">
              <p className="text-xs text-text-muted mb-0.5">Costo total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary font-display">
                  {formatARS(campana.totalGeneral)}
                </span>
                {varTotal && (
                  <span
                    className={`text-xs font-semibold ${
                      varTotal.positive ? 'text-error' : 'text-success'
                    }`}
                  >
                    {varTotal.text}
                  </span>
                )}
              </div>
            </div>

            {/* $/ha promedio */}
            <div className="mb-2">
              <p className="text-xs text-text-muted mb-0.5">Promedio $/ha</p>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-text-dim">
                  {formatARS(campana.promedioHa)}
                </span>
                {varHa && (
                  <span
                    className={`text-xs font-semibold ${
                      varHa.positive ? 'text-error' : 'text-success'
                    }`}
                  >
                    {varHa.text}
                  </span>
                )}
              </div>
            </div>

            {/* Lotes activos */}
            <div className="flex items-center justify-between pt-2 border-t border-border-warm">
              <span className="text-xs text-text-muted">Lotes activos</span>
              <span className="text-sm font-semibold text-text-dim">{lotesActivos}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
