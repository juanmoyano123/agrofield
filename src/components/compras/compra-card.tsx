import { useState } from 'react'
import type { Compra } from '../../types'
import { Badge } from '../ui/badge'

interface CompraCardProps {
  compra: Compra
}

function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD; parse carefully to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatAmount(amount: number, moneda: string): string {
  const locale = 'es-AR'
  const currency = moneda === 'USD' ? 'USD' : 'ARS'
  return amount.toLocaleString(locale, { style: 'currency', currency })
}

export function CompraCard({ compra }: CompraCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const firstItem = compra.items[0]
  const remainingCount = compra.items.length - 1

  const summaryText = firstItem
    ? remainingCount > 0
      ? `${firstItem.productoName} (y ${remainingCount} más)`
      : firstItem.productoName
    : 'Sin productos'

  return (
    <div
      className="
        bg-white border border-neutral-200 rounded-xl p-4
        cursor-pointer select-none
        hover:border-neutral-300 hover:shadow-sm
        transition-all duration-200
      "
      onClick={() => setIsExpanded(prev => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(prev => !prev) }}
      aria-expanded={isExpanded}
      aria-label={`Compra a ${compra.proveedorName}`}
    >
      {/* Card summary row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{summaryText}</p>
          <p className="text-xs text-neutral-500">{compra.proveedorName}</p>
          <p className="text-xs text-neutral-400">{formatDate(compra.fecha)}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-base font-bold text-neutral-900">
            {formatAmount(compra.total, compra.moneda)}
          </span>
          <Badge variant={compra.moneda === 'USD' ? 'usd' : 'ars'}>
            {compra.moneda}
          </Badge>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-2">
          {compra.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-neutral-700">
                {item.productoName}
                <span className="text-neutral-400 ml-1">
                  {item.cantidad} {item.unidad}
                </span>
              </span>
              <span className="font-semibold text-neutral-800">
                {formatAmount(item.subtotal, compra.moneda)}
              </span>
            </div>
          ))}

          {compra.numeroFactura && (
            <p className="text-xs text-neutral-400 mt-1">
              Factura: {compra.numeroFactura}
            </p>
          )}
          {compra.notas && (
            <p className="text-xs text-neutral-500 italic mt-1">
              {compra.notas}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
