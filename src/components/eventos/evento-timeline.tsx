import type { Evento } from '../../types'
import { EventoTimelineCard } from './evento-timeline-card'
import { EmptyState } from '../ui/empty-state'

interface EventoTimelineProps {
  eventos: Evento[]
  onEdit: (evento: Evento) => void
  onDelete: (evento: Evento) => void
  onAddClick: () => void
}

function formatMonthLabel(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, 1)
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function getMonthKey(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[0] ?? ''}-${parts[1] ?? ''}`
}

export function EventoTimeline({ eventos, onEdit, onDelete, onAddClick }: EventoTimelineProps) {
  if (eventos.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="Sin eventos registrados"
        description="Registrá el primer evento de campo para llevar un historial completo de este lote."
        action={{ label: 'Registrar evento', onClick: onAddClick }}
      />
    )
  }

  // Group by month
  const monthMap = new Map<string, Evento[]>()
  for (const evento of eventos) {
    const key = getMonthKey(evento.fecha)
    const group = monthMap.get(key) ?? []
    group.push(evento)
    monthMap.set(key, group)
  }

  const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col gap-10">
      {sortedMonths.map(monthKey => {
        const monthEventos = monthMap.get(monthKey) ?? []
        const label = formatMonthLabel(`${monthKey}-01`)

        return (
          <div key={monthKey}>
            {/* Month header */}
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 capitalize">
              {label}
            </h2>

            {/* Timeline vertical line */}
            <div className="relative border-l-2 border-field-green/30 ml-1.5 flex flex-col gap-4">
              {monthEventos.map(evento => (
                <EventoTimelineCard
                  key={evento.id}
                  evento={evento}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
