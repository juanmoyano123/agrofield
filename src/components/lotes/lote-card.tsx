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
        bg-white border-l-4 border-l-field-green rounded-lg shadow-sm p-6
        cursor-pointer hover:shadow-md transition-all duration-200
        flex flex-col gap-3
      "
    >
      {/* Header: nombre + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-neutral-900 font-display text-lg leading-tight">
          {lote.nombre}
        </h3>
        <Badge variant={actividadVariant[lote.actividad]}>
          {actividadLabel[lote.actividad]}
        </Badge>
      </div>

      {/* Superficie */}
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        <span>
          <span className="font-semibold text-neutral-900">{lote.hectareas.toLocaleString('es-AR')}</span>
          {' '}ha
        </span>
        {lote.ubicacion && (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={14} className="shrink-0 text-neutral-400" />
            <span className="truncate">{lote.ubicacion}</span>
          </span>
        )}
      </div>

      {/* Placeholders */}
      <div className="flex items-center gap-6 text-xs text-neutral-500 pt-1 border-t border-neutral-100">
        <span>
          Último evento: <span className="text-neutral-400">{lote.ultimoEvento ?? '—'}</span>
        </span>
        <span>
          Costo acumulado: <span className="text-neutral-400">—</span>
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
            rounded-md text-neutral-500
            hover:bg-neutral-100 hover:text-field-green
            transition-colors duration-200
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
            rounded-md text-neutral-500
            hover:bg-red-50 hover:text-error
            transition-colors duration-200
          "
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
