import type { Evento, TipoEvento } from '../../types'

interface EventoTimelineCardProps {
  evento: Evento
  onEdit: (evento: Evento) => void
  onDelete: (evento: Evento) => void
}

const TIPO_CONFIG: Record<TipoEvento, { icon: string; label: string; color: string }> = {
  siembra:    { icon: '🌱', label: 'Siembra',              color: 'bg-green-50 text-green-700 border-green-200' },
  aplicacion: { icon: '💧', label: 'Aplicación',           color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cosecha:    { icon: '🌾', label: 'Cosecha',              color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  monitoreo:  { icon: '🔍', label: 'Monitoreo',            color: 'bg-purple-50 text-purple-700 border-purple-200' },
  servicio:   { icon: '🔧', label: 'Servicio/Contratista', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  riego:      { icon: '🌧️', label: 'Riego',               color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  otro:       { icon: '📋', label: 'Otro',                 color: 'bg-parchment text-text-dim border-border-warm' },
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function EventoTimelineCard({ evento, onEdit, onDelete }: EventoTimelineCardProps) {
  const config = TIPO_CONFIG[evento.tipo]

  return (
    <div className="
      relative ml-6
      bg-surface border border-border-warm rounded-sm
      shadow-warm-sm hover:shadow-warm
      transition-all duration-300 hover:-translate-y-0.5
    ">
      {/* Timeline dot connector */}
      <div className="
        absolute -left-[25px] top-4
        w-3 h-3 rounded-full bg-field-green border-2 border-surface
        ring-2 ring-field-green/20
      " />

      <div className="p-4">
        {/* Header: tipo badge + fecha + actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1
              rounded-sm border text-xs font-semibold
              ${config.color}
            `}>
              <span>{config.icon}</span>
              {config.label}
            </span>
            <span className="text-xs text-text-muted font-medium">
              {formatDate(evento.fecha)}
            </span>
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(evento)}
              aria-label="Editar evento"
              className="
                w-8 h-8 flex items-center justify-center
                rounded-sm text-text-muted text-sm
                hover:bg-parchment hover:text-text-dim
                transition-colors duration-300
              "
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => onDelete(evento)}
              aria-label="Eliminar evento"
              className="
                w-8 h-8 flex items-center justify-center
                rounded-sm text-text-muted text-sm
                hover:bg-red-50 hover:text-error
                transition-colors duration-300
              "
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Insumos */}
        {evento.insumos.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Insumos
            </p>
            <div className="flex flex-col gap-1">
              {evento.insumos.map(insumo => (
                <div key={insumo.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-dim">{insumo.productoName}</span>
                  <span className="text-text-muted font-medium">
                    {insumo.cantidad} {insumo.unidad}
                    {insumo.subtotal > 0 && (
                      <span className="ml-2 text-text-primary font-semibold">
                        {formatCurrency(insumo.subtotal)}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {evento.notas && (
          <p className="text-sm text-text-dim italic mb-3 border-l-2 border-border-warm pl-2">
            {evento.notas}
          </p>
        )}

        {/* Footer: responsable + costo total */}
        <div className="flex items-center justify-between pt-2 border-t border-border-warm">
          <span className="text-xs text-text-muted">
            {evento.responsable ? `👤 ${evento.responsable}` : ''}
          </span>
          {evento.costoTotal > 0 && (
            <span className="text-sm font-bold text-text-primary">
              {formatCurrency(evento.costoTotal)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
