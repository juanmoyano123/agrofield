/**
 * F-027: ComparativaTable — Side-by-side comparison table.
 *
 * Rows: lotes
 * Columns: one per selected campaña (Total, $/ha) + variation % (first vs last)
 * Footer: totals per campaña
 * Mobile: horizontal scroll with sticky first column (lote name)
 */

import type { ComparativaCampanaData } from '../../lib/comparativa-utils'
import { getCampanaColor } from '../../lib/comparativa-utils'

interface ComparativaTableProps {
  data: ComparativaCampanaData[]
}

function formatARS(value: number): string {
  if (value === 0) return '—'
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatHa(value: number): string {
  if (value === 0) return '—'
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function calcVariation(base: number, last: number): string {
  if (base === 0) return '—'
  const pct = ((last - base) / base) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function variationClass(base: number, last: number): string {
  if (base === 0) return 'text-text-muted'
  const pct = ((last - base) / base) * 100
  if (pct > 0) return 'text-error font-semibold'
  if (pct < 0) return 'text-success font-semibold'
  return 'text-text-muted'
}

export function ComparativaTable({ data }: ComparativaTableProps) {
  if (data.length === 0) return null

  // Collect all lote names across all campañas
  const loteNames = Array.from(
    new Set(data.flatMap(d => d.costosPorLote.map(r => r.nombre))),
  )

  const primera = data[0]!
  const ultima = data[data.length - 1]!
  const showVariation = data.length >= 2

  return (
    <section
      className="bg-surface rounded-sm border border-border-warm shadow-warm-sm p-4"
      aria-labelledby="comparativa-table-title"
    >
      <div className="mb-4">
        <h2
          id="comparativa-table-title"
          className="text-base font-bold text-text-primary font-display"
        >
          Tabla comparativa
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Detalle de costos por lote y campaña
        </p>
      </div>

      {/* Horizontal scrollable wrapper */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 480 + data.length * 160 }}>
          <thead>
            <tr className="border-b border-border-warm">
              {/* Sticky lote column */}
              <th
                className="text-left py-2 pr-4 text-xs font-semibold text-text-muted uppercase tracking-wide sticky left-0 bg-surface"
                style={{ minWidth: 120 }}
              >
                Lote
              </th>

              {/* One set of columns per campaña */}
              {data.map((campana, index) => {
                const color = getCampanaColor(index)
                return (
                  <th
                    key={campana.campanaId}
                    colSpan={2}
                    className="py-2 px-2 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color, minWidth: 160 }}
                  >
                    {campana.campanaNombre}
                  </th>
                )
              })}

              {/* Variation column */}
              {showVariation && (
                <th className="py-2 px-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wide" style={{ minWidth: 80 }}>
                  Var %
                </th>
              )}
            </tr>

            {/* Sub-header: Total / $/ha labels */}
            <tr className="border-b border-border-warm">
              <th className="sticky left-0 bg-surface" />
              {data.map(campana => (
                <th
                  key={campana.campanaId}
                  colSpan={2}
                  className="py-1.5 text-center"
                >
                  <div className="flex gap-2 justify-center">
                    <span className="text-xs text-text-muted w-20 text-right">Total</span>
                    <span className="text-xs text-text-muted w-20 text-right">$/ha</span>
                  </div>
                </th>
              ))}
              {showVariation && <th />}
            </tr>
          </thead>

          <tbody>
            {loteNames.map(loteNombre => {
              const firstRow = primera.costosPorLote.find(r => r.nombre === loteNombre)
              const lastRow = ultima.costosPorLote.find(r => r.nombre === loteNombre)

              return (
                <tr
                  key={loteNombre}
                  className="border-b border-border-warm/50 hover:bg-parchment/30 transition-colors"
                >
                  {/* Lote name — sticky */}
                  <td className="py-2.5 pr-4 font-medium text-text-primary sticky left-0 bg-surface">
                    {loteNombre}
                  </td>

                  {data.map(campana => {
                    const row = campana.costosPorLote.find(r => r.nombre === loteNombre)
                    return (
                      <td key={campana.campanaId} colSpan={2} className="py-2.5 px-2">
                        <div className="flex gap-2 justify-center">
                          <span className="w-20 text-right text-text-dim">{formatARS(row?.costoTotal ?? 0)}</span>
                          <span className="w-20 text-right text-text-muted">{formatHa(row?.costoPorHa ?? 0)}</span>
                        </div>
                      </td>
                    )
                  })}

                  {/* Variation */}
                  {showVariation && (
                    <td className="py-2.5 px-2 text-center">
                      <span className={variationClass(firstRow?.costoTotal ?? 0, lastRow?.costoTotal ?? 0)}>
                        {calcVariation(firstRow?.costoTotal ?? 0, lastRow?.costoTotal ?? 0)}
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>

          {/* Footer — totals per campaña */}
          <tfoot>
            <tr className="border-t-2 border-border-warm bg-parchment/40">
              <td className="py-2.5 pr-4 font-bold text-text-primary text-xs uppercase tracking-wide sticky left-0 bg-parchment/40">
                Total
              </td>
              {data.map(campana => (
                <td key={campana.campanaId} colSpan={2} className="py-2.5 px-2">
                  <div className="flex gap-2 justify-center">
                    <span className="w-20 text-right font-bold text-text-primary">
                      {formatARS(campana.totalGeneral)}
                    </span>
                    <span className="w-20 text-right font-semibold text-text-dim">
                      {formatHa(campana.promedioHa)}
                    </span>
                  </div>
                </td>
              ))}
              {showVariation && (
                <td className="py-2.5 px-2 text-center">
                  <span className={variationClass(primera.totalGeneral, ultima.totalGeneral)}>
                    {calcVariation(primera.totalGeneral, ultima.totalGeneral)}
                  </span>
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
