/**
 * CampoLoteCard — mobile-first card displayed in CampoLotesPage.
 *
 * Shows:
 * - Lote name (large, prominent)
 * - Surface area in hectares
 * - Actividad badge (agricultura / ganaderia)
 * - A large "Registrar evento" CTA button (min 56 px tall, full width)
 *
 * F-013: Designed for one-handed operation on a smartphone.
 */

import type { Lote } from '../../types'

interface CampoLoteCardProps {
  lote: Lote
  onRegistrar: (loteId: string) => void
}

const actividadLabel: Record<string, string> = {
  agricultura: 'Agricultura',
  ganaderia: 'Ganadería',
}

const actividadColor: Record<string, string> = {
  agricultura: 'bg-field-green/10 text-field-green',
  ganaderia: 'bg-copper/10 text-copper',
}

export function CampoLoteCard({ lote, onRegistrar }: CampoLoteCardProps) {
  return (
    <div className="bg-surface rounded-sm border border-border-warm p-4 flex flex-col gap-3">
      {/* Lote info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-text-primary font-semibold text-lg leading-tight">{lote.nombre}</h2>
          <p className="text-text-muted text-sm mt-0.5">{lote.hectareas} ha</p>
        </div>

        {/* Actividad badge */}
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${actividadColor[lote.actividad] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {actividadLabel[lote.actividad] ?? lote.actividad}
        </span>
      </div>

      {/* Registrar evento CTA — large touch target */}
      <button
        type="button"
        onClick={() => onRegistrar(lote.id)}
        className="bg-field-green text-white min-h-[56px] w-full rounded-sm text-base font-semibold hover:bg-field-green/90 active:scale-[0.98] transition-all"
      >
        Registrar evento
      </button>
    </div>
  )
}
