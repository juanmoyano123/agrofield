/**
 * F-026: CostoKiloDetail — Expandable event detail panel for a single ganaderia lote.
 *
 * Shows per-event cost breakdown with fecha, concepto, and costoTotal.
 * Events with kgAtribuidos display an additional kg label.
 * A summary footer shows kg producidos and cost per kg.
 */

import type { CostoKiloLote, CostoKiloDesglose } from '../../lib/costo-kilo-utils'

interface CostoKiloDetailProps {
  row: CostoKiloLote
  desglose: CostoKiloDesglose[]
}

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatKg(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })} kg`
}

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

export function CostoKiloDetail({ row, desglose }: CostoKiloDetailProps) {
  // Separate events with costs from zero-cost events
  const conCosto = desglose.filter(d => d.costoTotal > 0)
  const sinCosto = desglose.filter(d => d.costoTotal === 0)

  return (
    <div className="bg-parchment border-t border-border-warm px-4 py-3 flex flex-col gap-4">

      {/* Summary stats row */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex flex-col">
          <span className="text-text-muted uppercase tracking-wide font-semibold">Kg producidos</span>
          <span className="text-text-primary font-bold">
            {row.kgProducidos > 0 ? formatKg(row.kgProducidos) : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-text-muted uppercase tracking-wide font-semibold">Stock actual</span>
          <span className="text-text-primary font-bold">
            {row.kgStockActual > 0 ? formatKg(row.kgStockActual) : '—'}
          </span>
        </div>
        {row.kgIngreso > 0 && (
          <div className="flex flex-col">
            <span className="text-text-muted uppercase tracking-wide font-semibold">Kg ingreso</span>
            <span className="text-text-primary font-bold">{formatKg(row.kgIngreso)}</span>
          </div>
        )}
        {row.kgSalida > 0 && (
          <div className="flex flex-col">
            <span className="text-text-muted uppercase tracking-wide font-semibold">Kg salida</span>
            <span className="text-text-primary font-bold">{formatKg(row.kgSalida)}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-text-muted uppercase tracking-wide font-semibold">Pesajes</span>
          <span className="text-text-primary font-bold">{row.cantidadPesajes}</span>
        </div>
      </div>

      {/* Events with costs */}
      {conCosto.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-text-dim uppercase tracking-wide">
              Eventos con costo
            </span>
            <span className="text-xs font-semibold text-text-dim">
              {formatARS(conCosto.reduce((s, d) => s + d.costoTotal, 0))}
            </span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {conCosto.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between text-xs py-1 border-b border-border-warm last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-text-muted shrink-0">{formatFecha(item.fecha)}</span>
                  <span className="text-text-primary truncate">{item.concepto}</span>
                  {item.kgAtribuidos != null && (
                    <span className="text-text-muted shrink-0 hidden sm:inline">
                      {formatKg(item.kgAtribuidos)}
                    </span>
                  )}
                </div>
                <span className="text-text-dim font-medium ml-3 shrink-0">
                  {formatARS(item.costoTotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Zero-cost events (pesajes, etc.) */}
      {sinCosto.length > 0 && (
        <div>
          <div className="mb-1.5">
            <span className="text-xs font-semibold text-text-dim uppercase tracking-wide">
              Pesajes y registros sin costo
            </span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {sinCosto.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between text-xs py-1 border-b border-border-warm last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-text-muted shrink-0">{formatFecha(item.fecha)}</span>
                  <span className="text-text-primary truncate">{item.concepto}</span>
                  {item.kgAtribuidos != null && (
                    <span className="text-field-green font-medium shrink-0">
                      {formatKg(item.kgAtribuidos)}
                    </span>
                  )}
                </div>
                <span className="text-text-muted ml-3 shrink-0">—</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grand total row */}
      {desglose.length > 0 && (
        <div className="flex items-center justify-between border-t-2 border-border-warm pt-2">
          <span className="text-xs font-bold text-text-primary">Total lote</span>
          <span className="text-xs font-bold text-copper">{formatARS(row.costosTotales)}</span>
        </div>
      )}

      {/* Empty fallback */}
      {desglose.length === 0 && (
        <p className="text-xs text-text-muted text-center py-2">
          Sin eventos registrados en este lote
        </p>
      )}

      {/* Data sufficiency notice */}
      {!row.tieneDatosSuficientes && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-2 py-1">
          Se necesitan al menos 2 pesajes para calcular kg producidos
        </p>
      )}
    </div>
  )
}
