import type { EventoRodeo } from '../../types'
import { RodeoTimelineCard } from './rodeo-timeline-card'
import { EmptyState } from '../ui/empty-state'

interface RodeoTimelineProps {
  eventos: EventoRodeo[]
  onEdit: (evento: EventoRodeo) => void
  onDelete: (evento: EventoRodeo) => void
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

export function RodeoTimeline({ eventos, onEdit, onDelete, onAddClick }: RodeoTimelineProps) {
  if (eventos.length === 0) {
    return (
      <EmptyState
        icon="🐄"
        title="Sin eventos de rodeo registrados"
        description="Registra el primer evento de rodeo para llevar un historial completo del ganado en este lote."
        action={{ label: 'Registrar evento de rodeo', onClick: onAddClick }}
      />
    )
  }

  // Group by month — sorted descending (most recent first)
  const monthMap = new Map<string, EventoRodeo[]>()
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

            {/* Timeline vertical line — copper color for livestock */}
            <div className="relative border-l-2 border-[#B5763A]/30 ml-1.5 flex flex-col gap-4">
              {monthEventos.map(evento => (
                <RodeoTimelineCard
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
