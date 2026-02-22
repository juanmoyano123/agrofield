/**
 * F-016: Vinculación Costo de Trabajo al Lote
 *
 * CostoResumenBar — collapsible summary strip showing aggregated cost breakdown
 * for a single lote. Designed to be placed between filters and the main content
 * so users can quickly see totals without scrolling.
 *
 * Layout:
 *   Left  — "Costo total: $X.XXX" in bold
 *   Right — "Eventos: $Y" chip (green) + "Contratistas: $Z" chip (copper) + "$/ha: $W" + chevron toggle
 *
 * Only rendered when costoTotal > 0 — callers should guard with that condition.
 */

import { ChevronDown } from 'lucide-react'
import type { CostoLote } from '../../lib/imputacion-utils'

interface CostoResumenBarProps {
  costo: CostoLote
  isExpanded: boolean
  onToggle: () => void
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
}

export function CostoResumenBar({ costo, isExpanded, onToggle }: CostoResumenBarProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label="Ver desglose de costos"
      className="
        w-full text-left
        bg-parchment border border-border-warm rounded-sm p-3
        flex flex-wrap sm:flex-nowrap items-center justify-between gap-2
        hover:border-border-warm-strong transition-colors duration-200
      "
    >
      {/* Left: total */}
      <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
        Costo total:&nbsp;
        <span className="text-field-green">{formatCurrency(costo.costoTotal)}</span>
      </span>

      {/* Right: chips + chevron */}
      <span className="flex items-center gap-2 flex-wrap">
        {/* Eventos chip — only when there are evento costs */}
        {costo.costoEventos > 0 && (
          <span className="
            inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold
            bg-[#EDF4EF] text-field-green border border-[#C5DBC9]
          ">
            Eventos: {formatCurrency(costo.costoEventos)}
          </span>
        )}

        {/* Contratistas chip — only when there are trabajo costs */}
        {costo.costoTrabajos > 0 && (
          <span className="
            inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold
            bg-[#FBF3E0] text-[#B5763A] border border-[#E8D5A0]
          ">
            Contratistas: {formatCurrency(costo.costoTrabajos)}
          </span>
        )}

        {/* Cost per ha */}
        {costo.costoPorHa > 0 && (
          <span className="text-xs text-text-muted whitespace-nowrap">
            {formatCurrency(costo.costoPorHa)}/ha
          </span>
        )}

        {/* Chevron toggle indicator */}
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </span>
    </button>
  )
}
