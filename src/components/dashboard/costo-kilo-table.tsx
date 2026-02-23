/**
 * F-026: CostoKiloTable — Expandable table for costo por kilo ganadero.
 *
 * Each row shows: Lote | Kg prod. | Total | $/kg | $/cab | chevron
 * Clicking a row toggles an inline CostoKiloDetail panel.
 * A footer row summarizes totals across all visible lotes.
 */

import type { CostoKiloLote, CostoKiloDesglose } from '../../lib/costo-kilo-utils'
import { CostoKiloDetail } from './costo-kilo-detail'

interface CostoKiloTableProps {
  rows: CostoKiloLote[]
  expandedId: string | null
  onToggle: (id: string) => void
  /** Pre-built desglose per lote */
  desglosePorLote: Map<string, CostoKiloDesglose[]>
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatKg(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })} kg`
}

export function CostoKiloTable({
  rows,
  expandedId,
  onToggle,
  desglosePorLote,
}: CostoKiloTableProps) {
  if (rows.length === 0) return null

  // Footer totals
  const totals = rows.reduce(
    (acc, r) => ({
      costosTotales: acc.costosTotales + r.costosTotales,
      kgProducidos: acc.kgProducidos + r.kgProducidos,
    }),
    { costosTotales: 0, kgProducidos: 0 },
  )

  const totalCostoPorKg = totals.kgProducidos > 0
    ? totals.costosTotales / totals.kgProducidos
    : 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Costo por kilo ganadero">
        <thead>
          <tr className="border-b border-border-warm">
            <th className="py-2 pr-4 text-left font-semibold text-text-muted">Lote</th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted hidden sm:table-cell">
              Kg prod.
            </th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted">Total</th>
            <th className="py-2 pr-4 text-right font-semibold text-text-muted">$/kg</th>
            <th className="py-2 text-right font-semibold text-text-muted hidden sm:table-cell">
              $/cab
            </th>
            {/* Chevron column */}
            <th className="py-2 w-6" />
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isExpanded = expandedId === row.loteId
            const desglose = desglosePorLote.get(row.loteId) ?? []

            return (
              <>
                <tr
                  key={row.loteId}
                  className="border-b border-border-warm cursor-pointer hover:bg-parchment transition-colors duration-150 select-none"
                  onClick={() => onToggle(row.loteId)}
                  aria-expanded={isExpanded}
                >
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-text-primary">{row.nombre}</span>
                    {row.cabezas > 0 && (
                      <span className="text-xs text-text-muted ml-1.5">
                        {row.cabezas.toLocaleString('es-AR')} cab.
                      </span>
                    )}
                    {!row.tieneDatosSuficientes && (
                      <span
                        title="Necesita al menos 2 pesajes"
                        className="ml-1.5 text-xs text-amber-600"
                      >
                        ⚠
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-text-dim hidden sm:table-cell">
                    {row.kgProducidos > 0 ? formatKg(row.kgProducidos) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-text-primary">
                    {row.costosTotales > 0 ? formatARS(row.costosTotales) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-text-muted">
                    {row.costoPorKg > 0 ? formatARS(row.costoPorKg) : '—'}
                  </td>
                  <td className="py-2.5 text-right text-text-muted hidden sm:table-cell">
                    {row.costoPorCab > 0 ? formatARS(row.costoPorCab) : '—'}
                  </td>
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

                {isExpanded && (
                  <tr key={`${row.loteId}-detail`}>
                    <td colSpan={6} className="p-0">
                      <CostoKiloDetail row={row} desglose={desglose} />
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
              {totals.kgProducidos > 0 ? formatKg(totals.kgProducidos) : '—'}
            </td>
            <td className="pt-3 pr-4 text-right font-bold text-copper">
              {totals.costosTotales > 0 ? formatARS(totals.costosTotales) : '—'}
            </td>
            <td className="pt-3 pr-4 text-right font-semibold text-text-primary">
              {totalCostoPorKg > 0 ? formatARS(totalCostoPorKg) : '—'}
            </td>
            <td className="pt-3 hidden sm:table-cell" />
            <td className="pt-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
