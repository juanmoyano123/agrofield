/**
 * F-016: Vinculación Costo de Trabajo al Lote
 *
 * CostoDesglose — detail view showing individual cost line-items for a lote.
 *
 * Two variants:
 *   'full'    — grouped table with Eventos section + Contratistas section,
 *               subtotals per section, bold totals row at bottom.
 *               Used in EventosPage.
 *
 *   'compact' — flat list of the first maxLineas entries (default 5),
 *               with "y N más..." indicator if truncated.
 *               Used in LoteCard expandable section.
 *
 * When lineas is empty, renders a muted italic placeholder.
 */

import { Badge } from '../ui/badge'
import type { LineaCosto } from '../../lib/imputacion-utils'

interface CostoDesgloseProps {
  lineas: LineaCosto[]
  variant: 'full' | 'compact'
  /** compact mode: maximum number of lines to show before truncating (default 5) */
  maxLineas?: number
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
}

function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD; parse carefully to avoid timezone offset issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <p className="text-xs text-text-muted italic py-2 text-center">
      Sin costos registrados
    </p>
  )
}

// ─── Full variant ─────────────────────────────────────────────────────────────

function CostoDesgloseFullView({ lineas }: { lineas: LineaCosto[] }) {
  const eventoLineas = lineas.filter(l => l.tipo === 'evento')
  const trabajoLineas = lineas.filter(l => l.tipo === 'trabajo')

  const subtotalEventos = eventoLineas.reduce((sum, l) => sum + l.subtotal, 0)
  const subtotalTrabajos = trabajoLineas.reduce((sum, l) => sum + l.subtotal, 0)
  const total = subtotalEventos + subtotalTrabajos

  return (
    <div className="bg-parchment border border-border-warm rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-warm bg-surface">
            <th className="text-left text-xs text-text-muted font-semibold uppercase tracking-wide px-3 py-2">
              Fecha
            </th>
            <th className="text-left text-xs text-text-muted font-semibold uppercase tracking-wide px-3 py-2">
              Concepto
            </th>
            <th className="text-right text-xs text-text-muted font-semibold uppercase tracking-wide px-3 py-2">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Eventos section */}
          {eventoLineas.length > 0 && (
            <>
              <tr>
                <td colSpan={3} className="px-3 py-1.5 bg-[#EDF4EF]">
                  <div className="flex items-center justify-between">
                    <Badge variant="success">Eventos</Badge>
                    <span className="text-xs font-semibold text-field-green">
                      {formatCurrency(subtotalEventos)}
                    </span>
                  </div>
                </td>
              </tr>
              {eventoLineas.map(linea => (
                <tr key={linea.id} className="border-b border-border-warm last:border-0 hover:bg-surface/60 transition-colors">
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {formatDate(linea.fecha)}
                  </td>
                  <td className="px-3 py-2 text-text-dim">
                    {linea.concepto}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-text-primary whitespace-nowrap">
                    {formatCurrency(linea.subtotal)}
                  </td>
                </tr>
              ))}
            </>
          )}

          {/* Contratistas section */}
          {trabajoLineas.length > 0 && (
            <>
              <tr>
                <td colSpan={3} className="px-3 py-1.5 bg-[#FBF3E0]">
                  <div className="flex items-center justify-between">
                    <Badge variant="warning">Contratistas</Badge>
                    <span className="text-xs font-semibold text-[#B5763A]">
                      {formatCurrency(subtotalTrabajos)}
                    </span>
                  </div>
                </td>
              </tr>
              {trabajoLineas.map(linea => (
                <tr key={linea.id} className="border-b border-border-warm last:border-0 hover:bg-surface/60 transition-colors">
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {formatDate(linea.fecha)}
                  </td>
                  <td className="px-3 py-2 text-text-dim">
                    {linea.concepto}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-text-primary whitespace-nowrap">
                    {formatCurrency(linea.subtotal)}
                  </td>
                </tr>
              ))}
            </>
          )}

          {/* Totals row */}
          <tr className="border-t-2 border-border-warm bg-surface">
            <td className="px-3 py-2 text-xs font-bold text-text-primary uppercase tracking-wide" colSpan={2}>
              Total
            </td>
            <td className="px-3 py-2 text-right font-bold text-text-primary whitespace-nowrap">
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Compact variant ──────────────────────────────────────────────────────────

function CostoDesgloseCompactView({ lineas, maxLineas }: { lineas: LineaCosto[]; maxLineas: number }) {
  const visible = lineas.slice(0, maxLineas)
  const remaining = lineas.length - visible.length

  return (
    <div className="flex flex-col gap-1">
      {visible.map(linea => (
        <div
          key={linea.id}
          className="flex items-center justify-between text-xs gap-2 py-0.5"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Small colored dot to indicate type */}
            <span
              className={`
                shrink-0 w-1.5 h-1.5 rounded-full
                ${linea.tipo === 'evento' ? 'bg-field-green' : 'bg-[#B5763A]'}
              `}
            />
            <span className="text-text-muted whitespace-nowrap">{formatDate(linea.fecha)}</span>
            <span className="text-text-dim truncate">{linea.concepto}</span>
          </div>
          <span className="font-semibold text-text-primary whitespace-nowrap shrink-0">
            {formatCurrency(linea.subtotal)}
          </span>
        </div>
      ))}

      {remaining > 0 && (
        <p className="text-xs text-text-muted italic pt-0.5">
          y {remaining} {remaining === 1 ? 'más...' : 'más...'}
        </p>
      )}
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function CostoDesglose({ lineas, variant, maxLineas = 5 }: CostoDesgloseProps) {
  if (lineas.length === 0) {
    return <EmptyState />
  }

  if (variant === 'full') {
    return <CostoDesgloseFullView lineas={lineas} />
  }

  return <CostoDesgloseCompactView lineas={lineas} maxLineas={maxLineas} />
}
