/**
 * F-007: CostoLotesDetail — Expandable cost breakdown panel for a single lote.
 *
 * Shown inline beneath a table row when the user toggles a lote open.
 * Groups line items into two sections: Eventos and Contratistas.
 * Each section shows individual entries with fecha, concepto, and subtotal.
 * A footer row shows the combined total for the lote.
 */

import type { LineaCosto } from '../../lib/imputacion-utils'

interface CostoLotesDetailProps {
  loteId: string
  hectareas: number
  lineas: LineaCosto[]
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatFecha(fecha: string): string {
  // YYYY-MM-DD → DD/MM/YYYY
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function CostoLotesDetail({ lineas }: CostoLotesDetailProps) {
  // Partition lineas by type
  const lineasEventos = lineas.filter(l => l.tipo === 'evento')
  const lineasTrabajos = lineas.filter(l => l.tipo === 'trabajo')

  const totalEventos = lineasEventos.reduce((sum, l) => sum + l.subtotal, 0)
  const totalTrabajos = lineasTrabajos.reduce((sum, l) => sum + l.subtotal, 0)
  const totalGeneral = totalEventos + totalTrabajos

  return (
    <div className="bg-parchment border-t border-border-warm px-4 py-3 flex flex-col gap-4">
      {/* Eventos section */}
      {lineasEventos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-text-dim uppercase tracking-wide">
              Eventos
            </span>
            <span className="text-xs font-semibold text-text-dim">{formatARS(totalEventos)}</span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {lineasEventos.map(linea => (
              <li
                key={linea.id}
                className="flex items-center justify-between text-xs py-1 border-b border-border-warm last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-text-muted shrink-0">{formatFecha(linea.fecha)}</span>
                  <span className="text-text-primary truncate">{linea.concepto}</span>
                </div>
                <span className="text-text-dim font-medium ml-3 shrink-0">
                  {formatARS(linea.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contratistas section */}
      {lineasTrabajos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-text-dim uppercase tracking-wide">
              Contratistas
            </span>
            <span className="text-xs font-semibold text-text-dim">{formatARS(totalTrabajos)}</span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {lineasTrabajos.map(linea => (
              <li
                key={linea.id}
                className="flex items-center justify-between text-xs py-1 border-b border-border-warm last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-text-muted shrink-0">{formatFecha(linea.fecha)}</span>
                  <span className="text-text-primary truncate">{linea.concepto}</span>
                </div>
                <span className="text-text-dim font-medium ml-3 shrink-0">
                  {formatARS(linea.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grand total row */}
      {lineas.length > 0 && (
        <div className="flex items-center justify-between border-t-2 border-border-warm pt-2">
          <span className="text-xs font-bold text-text-primary">Total lote</span>
          <span className="text-xs font-bold text-copper">{formatARS(totalGeneral)}</span>
        </div>
      )}

      {/* Empty fallback */}
      {lineas.length === 0 && (
        <p className="text-xs text-text-muted text-center py-2">
          Sin registros en este período
        </p>
      )}
    </div>
  )
}
