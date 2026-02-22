import type { EventoRodeo, TipoEventoRodeo, CategoriaRodeo } from '../../types'

interface RodeoTimelineCardProps {
  evento: EventoRodeo
  onEdit: (evento: EventoRodeo) => void
  onDelete: (evento: EventoRodeo) => void
}

const CATEGORIA_CONFIG: Record<CategoriaRodeo, { icon: string; label: string; color: string }> = {
  pesaje:      { icon: '⚖️', label: 'Pesaje',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  sanidad:     { icon: '💉', label: 'Sanidad',       color: 'bg-red-50 text-red-700 border-red-200' },
  reproduccion:{ icon: '🐄', label: 'Reproducción',  color: 'bg-pink-50 text-pink-700 border-pink-200' },
  movimiento:  { icon: '↕️', label: 'Movimiento',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const TIPO_LABELS: Record<TipoEventoRodeo, string> = {
  pesaje:         'Pesaje',
  vacunacion:     'Vacunación',
  desparasitacion:'Desparasitación',
  curacion:       'Curación',
  servicio_toro:  'Servicio toro',
  inseminacion:   'Inseminación',
  tacto:          'Tacto',
  paricion:       'Parición',
  destete:        'Destete',
  ingreso:        'Ingreso',
  egreso:         'Egreso',
  muerte:         'Muerte',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatKg(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`
}

/** Renders type-specific detail rows beneath the card header */
function EventoRodeoDetail({ evento }: { evento: EventoRodeo }) {
  switch (evento.tipo) {
    case 'pesaje':
      return (
        <div className="flex flex-wrap gap-4 text-sm">
          {evento.pesoPromedio !== undefined && (
            <span className="text-text-dim">
              Peso prom: <span className="font-semibold text-text-primary">{formatKg(evento.pesoPromedio)}</span>
            </span>
          )}
          {evento.pesoTotal !== undefined && (
            <span className="text-text-dim">
              Total: <span className="font-semibold text-text-primary">{formatKg(evento.pesoTotal)}</span>
            </span>
          )}
        </div>
      )

    case 'vacunacion':
    case 'desparasitacion':
    case 'curacion':
      return (
        <div className="flex flex-col gap-1 text-sm">
          {evento.productoSanitario && (
            <span className="text-text-dim">
              Producto: <span className="font-semibold text-text-primary">{evento.productoSanitario}</span>
              {evento.dosisMl !== undefined && (
                <span className="text-text-muted ml-1">({evento.dosisMl} ml)</span>
              )}
            </span>
          )}
          {evento.veterinario && (
            <span className="text-text-muted text-xs">Vet: {evento.veterinario}</span>
          )}
          {evento.proximaDosis && (
            <span className="text-text-muted text-xs">
              Proxima dosis: {formatDate(evento.proximaDosis)}
            </span>
          )}
        </div>
      )

    case 'tacto':
      return (
        <div className="flex flex-wrap gap-4 text-sm">
          {evento.cantidadPreniadas !== undefined && (
            <span className="text-text-dim">
              Prenadas: <span className="font-semibold text-green-700">{evento.cantidadPreniadas}</span>
            </span>
          )}
          {evento.cantidadVacias !== undefined && (
            <span className="text-text-dim">
              Vacias: <span className="font-semibold text-red-700">{evento.cantidadVacias}</span>
            </span>
          )}
          {evento.cantidadPreniadas !== undefined && evento.cantidadCabezas > 0 && (
            <span className="text-text-muted text-xs">
              ({Math.round((evento.cantidadPreniadas / evento.cantidadCabezas) * 100)}% prenez)
            </span>
          )}
        </div>
      )

    case 'paricion':
    case 'destete':
      return (
        <div className="flex flex-wrap gap-4 text-sm">
          {evento.pesoDestete !== undefined && (
            <span className="text-text-dim">
              Peso: <span className="font-semibold text-text-primary">{formatKg(evento.pesoDestete)}</span>
            </span>
          )}
        </div>
      )

    case 'ingreso':
    case 'egreso':
    case 'muerte':
      return (
        <div className="flex flex-col gap-1 text-sm">
          {evento.motivo && (
            <span className="text-text-dim">{evento.motivo}</span>
          )}
          {evento.origenDestino && (
            <span className="text-text-muted text-xs">{evento.origenDestino}</span>
          )}
          {evento.precioUnitario !== undefined && (
            <span className="text-text-muted text-xs">
              Precio unitario: {formatCurrency(evento.precioUnitario)}
            </span>
          )}
        </div>
      )

    default:
      return null
  }
}

export function RodeoTimelineCard({ evento, onEdit, onDelete }: RodeoTimelineCardProps) {
  const categoriaConfig = CATEGORIA_CONFIG[evento.categoria]
  const tipoLabel = TIPO_LABELS[evento.tipo]

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
        w-3 h-3 rounded-full bg-[#B5763A] border-2 border-surface
        ring-2 ring-[#B5763A]/20
      " />

      <div className="p-4">
        {/* Header: categoria badge + tipo label + fecha + actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Categoria badge */}
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1
              rounded-sm border text-xs font-semibold
              ${categoriaConfig.color}
            `}>
              <span>{categoriaConfig.icon}</span>
              {categoriaConfig.label}
            </span>

            {/* Tipo especifico */}
            <span className="text-xs font-medium text-text-dim bg-parchment border border-border-warm px-2 py-1 rounded-sm">
              {tipoLabel}
            </span>

            {/* Fecha */}
            <span className="text-xs text-text-muted font-medium">
              {formatDate(evento.fecha)}
            </span>
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(evento)}
              aria-label="Editar evento de rodeo"
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
              aria-label="Eliminar evento de rodeo"
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

        {/* Cantidad de cabezas */}
        <div className="mb-3">
          <span className="text-sm text-text-dim">
            Cabezas: <span className="font-bold text-text-primary">{evento.cantidadCabezas}</span>
          </span>
        </div>

        {/* Type-specific detail */}
        <div className="mb-3">
          <EventoRodeoDetail evento={evento} />
        </div>

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
