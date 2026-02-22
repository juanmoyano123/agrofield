import { useState } from 'react'
import { Pencil, Trash2, MapPin, ChevronDown } from 'lucide-react'
import { Badge } from '../ui/badge'
import { useImputacionLote } from '../../hooks/use-imputacion'
import { CostoDesglose } from '../costos/costo-desglose'
import type { Lote } from '../../types'
import type { CostoLote } from '../../lib/imputacion-utils'

interface LoteCardProps {
  lote: Lote
  onEdit: (lote: Lote) => void
  onDelete: (lote: Lote) => void
  onClick?: (lote: Lote) => void
  /** F-005: Derived cost data for this lote from the imputacion engine */
  costoLote?: CostoLote
}

const actividadLabel: Record<string, string> = {
  agricultura: 'Agricultura',
  ganaderia: 'Ganadería',
}

// F-021: Labels for livestock production types
const tipoProduccionLabel: Record<string, string> = {
  cria: 'Cría',
  recria: 'Recría',
  engorde: 'Engorde',
  tambo: 'Tambo',
}

const actividadVariant: Record<string, 'success' | 'warning'> = {
  agricultura: 'success',
  ganaderia: 'warning',
}

export function LoteCard({ lote, onEdit, onDelete, onClick, costoLote }: LoteCardProps) {
  // F-016: Per-lote cost breakdown with collapsible detail section
  const { costo, lineas } = useImputacionLote(lote.id, lote.hectareas)
  const [isDetalleCostoOpen, setIsDetalleCostoOpen] = useState(false)

  // Use the derived costo from imputacion engine (supersedes the costoLote prop
  // which is kept for backwards compatibility from lotes-page)
  const costoDisplay = costo.costoTotal > 0 ? costo : costoLote

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(lote)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(lote)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(lote)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(lote) }}
      className="
        bg-surface border-l-2 border-l-copper rounded-sm shadow-warm-sm p-6
        cursor-pointer hover:-translate-y-0.5 hover:shadow-warm transition-all duration-300
        flex flex-col gap-3
      "
    >
      {/* Header: nombre + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-text-primary font-display text-lg leading-tight">
          {lote.nombre}
        </h3>
        <Badge variant={actividadVariant[lote.actividad]}>
          {actividadLabel[lote.actividad]}
        </Badge>
      </div>

      {/* Superficie */}
      <div className="flex items-center gap-4 text-sm text-text-dim">
        <span>
          <span className="font-semibold text-text-primary">{lote.hectareas.toLocaleString('es-AR')}</span>
          {' '}ha
        </span>
        {lote.ubicacion && (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={14} className="shrink-0 text-text-muted" />
            <span className="truncate">{lote.ubicacion}</span>
          </span>
        )}
      </div>

      {/* F-021: Livestock data — only shown for ganaderia lotes that have cabezas set */}
      {lote.actividad === 'ganaderia' && lote.cabezas && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-dim mt-2">
          <span>
            <span className="font-semibold text-text-primary">{lote.cabezas.toLocaleString('es-AR')}</span>
            {' '}cabezas
          </span>
          {lote.raza && (
            <span>
              Raza: <span className="font-semibold text-text-primary">{lote.raza}</span>
            </span>
          )}
          {lote.tipoProduccion && (
            <span className="text-xs bg-parchment border border-border-warm px-2 py-0.5 rounded-sm">
              {tipoProduccionLabel[lote.tipoProduccion]}
            </span>
          )}
        </div>
      )}

      {/* Costo acumulado — powered by F-005/F-016 imputacion engine */}
      <div className="pt-1 border-t border-border-warm">
        <div className="flex items-center gap-6 text-xs text-text-muted mb-2">
          <span>
            Último evento: <span className="text-text-muted">{lote.ultimoEvento ?? '—'}</span>
          </span>
        </div>

        {/* F-016: Clickable cost row that toggles the desglose panel */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsDetalleCostoOpen(prev => !prev) }}
          className="w-full text-left flex items-center justify-between hover:bg-parchment rounded-sm px-1 -mx-1 py-0.5 transition-colors duration-200"
          aria-expanded={isDetalleCostoOpen}
          aria-label="Ver desglose de costos"
        >
          <span className="text-sm text-text-muted">Costo acumulado</span>
          <div className="flex items-center gap-1.5">
            <div className="text-right">
              <span className="font-semibold text-text-primary text-sm">
                {costoDisplay
                  ? `$${costoDisplay.costoTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
                  : '—'}
              </span>
              {costoDisplay && costoDisplay.costoPorHa > 0 && (
                <span className="text-xs text-text-muted block">
                  ${costoDisplay.costoPorHa.toLocaleString('es-AR', { maximumFractionDigits: 0 })}/ha
                </span>
              )}
            </div>
            {costo.costoTotal > 0 && (
              <ChevronDown
                size={14}
                className={`text-text-muted transition-transform duration-200 shrink-0 ${isDetalleCostoOpen ? 'rotate-180' : ''}`}
              />
            )}
          </div>
        </button>

        {/* Expandable cost breakdown — compact variant */}
        {isDetalleCostoOpen && costo.costoTotal > 0 && (
          <div className="mt-2">
            <CostoDesglose lineas={lineas} variant="compact" maxLineas={4} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          aria-label={`Editar ${lote.nombre}`}
          onClick={handleEdit}
          className="
            min-h-[44px] min-w-[44px] flex items-center justify-center
            rounded-sm text-text-muted
            hover:bg-parchment hover:text-field-green
            transition-colors duration-300
          "
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${lote.nombre}`}
          onClick={handleDelete}
          className="
            min-h-[44px] min-w-[44px] flex items-center justify-center
            rounded-sm text-text-muted
            hover:bg-[#FAEAE8] hover:text-error
            transition-colors duration-300
          "
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
