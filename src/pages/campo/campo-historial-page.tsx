/**
 * CampoHistorialPage — today's event log for the Encargado de Campo.
 *
 * Shows all eventos that occurred on today's date across every lote
 * of the tenant, sorted chronologically.
 *
 * Each row displays:
 * - Creation time (extracted from createdAt).
 * - Lote name (looked up from the lotes store).
 * - Tipo badge.
 * - Notas preview (truncated).
 *
 * A summary line at the top shows the total number of events today.
 *
 * F-013: Calls fetchAllEventos (cross-lote) and filters by today's date.
 */

import { useEffect } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useEventosStore } from '../../stores/eventos-store'
import { useLotes } from '../../hooks/use-lotes'
import { Spinner } from '../../components/ui/spinner'
import type { Evento } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatHora(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}

const tipoLabel: Record<string, string> = {
  siembra: 'Siembra',
  aplicacion: 'Aplicacion',
  cosecha: 'Cosecha',
  monitoreo: 'Monitoreo',
  servicio: 'Servicio',
  riego: 'Riego',
  otro: 'Otro',
}

const tipoColor: Record<string, string> = {
  siembra: 'bg-field-green/10 text-field-green',
  aplicacion: 'bg-copper/10 text-copper',
  cosecha: 'bg-yellow-100 text-yellow-800',
  monitoreo: 'bg-blue-100 text-blue-700',
  servicio: 'bg-purple-100 text-purple-700',
  riego: 'bg-sky-100 text-sky-700',
  otro: 'bg-gray-100 text-gray-600',
}

// ─── Sub-component: single event row ─────────────────────────────────────────

function EventoRow({ evento, loteName }: { evento: Evento; loteName: string }) {
  const color = tipoColor[evento.tipo] ?? 'bg-gray-100 text-gray-600'
  const label = tipoLabel[evento.tipo] ?? evento.tipo

  return (
    <div className="bg-surface border border-border-warm rounded-sm p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-text-muted text-xs shrink-0">
            {formatHora(evento.createdAt)}
          </span>
          <span className="text-text-primary text-sm font-medium truncate">{loteName}</span>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
          {label}
        </span>
      </div>
      {evento.notas && (
        <p className="text-text-muted text-xs line-clamp-2 pl-[3.5rem]">{evento.notas}</p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CampoHistorialPage() {
  const { user } = useAuth()
  const { lotes, fetchLotes } = useLotes()

  // Use the store directly to access fetchAllEventos (cross-lote fetch)
  const eventos = useEventosStore(s => s.eventos)
  const isLoading = useEventosStore(s => s.isLoading)
  const fetchAllEventos = useEventosStore(s => s.fetchAllEventos)

  // Fetch all eventos for the tenant on mount
  useEffect(() => {
    if (user?.tenantId) {
      fetchAllEventos(user.tenantId)
    }
  }, [user?.tenantId, fetchAllEventos])

  // Also ensure lotes are loaded (for name lookup)
  useEffect(() => {
    if (user?.tenantId && lotes.length === 0) {
      fetchLotes(user.tenantId)
    }
  }, [user?.tenantId, lotes.length, fetchLotes])

  // Build a lote id → name lookup map
  const loteNameMap = new Map(lotes.map(l => [l.id, l.nombre]))

  // Filter to today's events (match on fecha field, which is YYYY-MM-DD)
  const today = getTodayISO()
  const todayEventos: Evento[] = eventos
    .filter(e => !e.deletedAt && e.fecha === today)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div className="flex flex-col gap-4">
      {/* Title + summary */}
      <div>
        <h1 className="text-text-primary font-display font-semibold text-xl">Historial de hoy</h1>
        {!isLoading && (
          <p className="text-text-muted text-sm mt-0.5">
            {todayEventos.length === 0
              ? 'Sin eventos registrados hoy.'
              : `${todayEventos.length} evento${todayEventos.length !== 1 ? 's' : ''} registrado${todayEventos.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : todayEventos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">
            No hay eventos registrados hoy.
          </p>
          <p className="text-text-muted text-xs mt-1">
            Los eventos aparecen aqui en tiempo real.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {todayEventos.map(evento => (
            <EventoRow
              key={evento.id}
              evento={evento}
              loteName={loteNameMap.get(evento.loteId) ?? evento.loteId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
