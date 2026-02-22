import { Pencil, Trash2, MapPin } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { Lote } from '../../types'

interface LoteCardProps {
  lote: Lote
  onEdit: (lote: Lote) => void
  onDelete: (lote: Lote) => void
  onClick?: (lote: Lote) => void
}

const actividadLabel: Record<string, string> = {
  agricultura: 'Agricultura',
  ganaderia: 'Ganadería',
}

const actividadVariant: Record<string, 'success' | 'warning'> = {
  agricultura: 'success',
  ganaderia: 'warning',
}

export function LoteCard({ lote, onEdit, onDelete, onClick }: LoteCardProps) {
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

      {/* Placeholders */}
      <div className="flex items-center gap-6 text-xs text-text-muted pt-1 border-t border-border-warm">
        <span>
          Último evento: <span className="text-text-muted">{lote.ultimoEvento ?? '—'}</span>
        </span>
        <span>
          Costo acumulado: <span className="text-text-muted">—</span>
        </span>
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
