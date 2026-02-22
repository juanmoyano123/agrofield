import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { TrabajoContratista } from '../../types'

interface TrabajoCardProps {
  trabajo: TrabajoContratista
  onEdit: (trabajo: TrabajoContratista) => void
  onDelete: (trabajo: TrabajoContratista) => void
}

const tipoLabel: Record<string, string> = {
  arado: 'Arado',
  siembra: 'Siembra',
  cosecha: 'Cosecha',
  pulverizacion: 'Pulverización',
  otro: 'Otro',
}

export function TrabajoCard({ trabajo, onEdit, onDelete }: TrabajoCardProps) {
  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(trabajo)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(trabajo)
  }

  // Format date as DD/MM/YYYY for display
  const fechaDisplay = trabajo.fecha
    ? new Date(trabajo.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

  // Format cost as $X.XXX
  const costoDisplay = `$${trabajo.costo.toLocaleString('es-AR')}`

  return (
    <div
      className="
        bg-surface border-l-2 border-l-copper rounded-sm shadow-warm-sm p-5
        hover:-translate-y-0.5 hover:shadow-warm transition-all duration-300
        flex flex-col gap-3
      "
    >
      {/* Header: tipo + badge estado */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-text-primary font-display text-base leading-tight">
          {tipoLabel[trabajo.tipo] ?? trabajo.tipo}
        </h3>
        <Badge variant={trabajo.estado === 'completado' ? 'success' : 'warning'}>
          {trabajo.estado === 'completado' ? 'Completado' : 'Programado'}
        </Badge>
      </div>

      {/* Body: fecha, contratista, lote */}
      <div className="flex flex-col gap-1 text-sm text-text-dim">
        <span>
          <span className="text-text-muted">Fecha:</span>{' '}
          <span className="font-medium text-text-primary">{fechaDisplay}</span>
        </span>
        <span>
          <span className="text-text-muted">Contratista:</span>{' '}
          <span className="font-medium">{trabajo.contratistaNombre}</span>
        </span>
        <span>
          <span className="text-text-muted">Lote:</span>{' '}
          <span className="font-medium">{trabajo.loteNombre ?? 'Gasto general'}</span>
        </span>
        {trabajo.notas && (
          <span className="text-text-muted text-xs mt-1 italic truncate" title={trabajo.notas}>
            {trabajo.notas}
          </span>
        )}
      </div>

      {/* Footer: costo + acciones */}
      <div className="flex items-center justify-between pt-2 border-t border-border-warm">
        <span className="font-bold text-text-primary text-lg">{costoDisplay}</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={`Editar trabajo de ${trabajo.contratistaNombre}`}
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
            aria-label={`Eliminar trabajo de ${trabajo.contratistaNombre}`}
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
    </div>
  )
}
