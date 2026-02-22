/**
 * F-007: CostoLotesTable — Sortable table with expandable detail rows.
 *
 * Each row shows Lote | Eventos | Contratistas | Total | $/ha.
 * Clicking a row toggles an inline CostoLotesDetail panel beneath it.
 * A footer row summarises totals across all visible lotes.
 *
 * The detail panel fetches line items via buildLineasCosto so that the
 * period-filtered eventos and trabajos passed from the widget are used.
 */

import type { CostoLoteRow } from '../../lib/dashboard-utils'
import type { LineaCosto } from '../../lib/imputacion-utils'
import { CostoLotesDetail } from './costo-lotes-detail'

interface CostoLotesTableProps {
  rows: CostoLoteRow[]
  expandedId: string | null
  onToggle: (id: string) => void
  /** Pre-built line items per lote (already period-filtered) */
  lineasPorLote: Map<string, LineaCosto[]>
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function CostoLotesTable({
  rows,
  expandedId,
  onToggle,
  lineasPorLote,
}: CostoLotesTableProps) {
  if (rows.length === 0) return null

  // Aggregate footer totals
  const totals = rows.reduce(
    (acc, r) => ({
      costoEventos: acc.costoEventos + r.costoEventos,
      costoTrabajos: acc.costoTrabajos + r.costoTrabajos,
      costoTotal: acc.costoTotal + r.costoTotal,
    }),
    { costoEventos: 0, costoTrabajos: 0, costoTotal: 0 },
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Costos por lote">
        <thead>
          <tr className="border-b border-border-warm">
            <th className="py-2 pr-4 text-left font-semibold text-text-muted">Lote</th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted hidden sm:table-cell">
              Eventos
            </th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted hidden sm:table-cell">
              Contratistas
            </th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted">Total</th>
            <th className="py-2 text-right font-semibold text-text-muted">$/ha</th>
            {/* Chevron column — no header text */}
            <th className="py-2 w-6" />
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isExpanded = expandedId === row.loteId
            const lineas = lineasPorLote.get(row.loteId) ?? []

            return (
              <>
                {/* Data row — clickable to toggle detail */}
                <tr
                  key={row.loteId}
                  className="border-b border-border-warm cursor-pointer hover:bg-parchment transition-colors duration-150 select-none"
                  onClick={() => onToggle(row.loteId)}
                  aria-expanded={isExpanded}
                >
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-text-primary">{row.nombre}</span>
                    <span className="text-xs text-text-muted ml-1.5">
                      {row.hectareas.toLocaleString('es-AR')} ha
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-text-dim hidden sm:table-cell">
                    {row.costoEventos > 0 ? formatARS(row.costoEventos) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-text-dim hidden sm:table-cell">
                    {row.costoTrabajos > 0 ? formatARS(row.costoTrabajos) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-text-primary">
                    {row.costoTotal > 0 ? formatARS(row.costoTotal) : '—'}
                  </td>
                  <td className="py-2.5 text-right text-text-muted">
                    {row.costoPorHa > 0 ? formatARS(row.costoPorHa) : '—'}
                  </td>
                  {/* Expand/collapse chevron */}
                  <td className="py-2.5 pl-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className={[
                        'w-4 h-4 text-text-muted transition-transform duration-200',
                        isExpanded ? 'rotate-180' : '',
                      ].join(' ')}
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </td>
                </tr>

                {/* Expanded detail row — full-width, spans all columns */}
                {isExpanded && (
                  <tr key={`${row.loteId}-detail`}>
                    <td colSpan={6} className="p-0">
                      <CostoLotesDetail
                        loteId={row.loteId}
                        hectareas={row.hectareas}
                        lineas={lineas}
                      />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>

        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-border-warm bg-parchment">
            <td className="pt-3 pr-4 font-bold text-text-primary">Total</td>
            <td className="pt-3 pr-4 text-right font-semibold text-text-primary hidden sm:table-cell">
              {totals.costoEventos > 0 ? formatARS(totals.costoEventos) : '—'}
            </td>
            <td className="pt-3 pr-4 text-right font-semibold text-text-primary hidden sm:table-cell">
              {totals.costoTrabajos > 0 ? formatARS(totals.costoTrabajos) : '—'}
            </td>
            <td className="pt-3 pr-4 text-right font-bold text-copper">
              {totals.costoTotal > 0 ? formatARS(totals.costoTotal) : '—'}
            </td>
            <td className="pt-3" />
            <td className="pt-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
