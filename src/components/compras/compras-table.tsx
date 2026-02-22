import { useState } from 'react'
import type { Compra } from '../../types'
import { Badge } from '../ui/badge'
import { EmptyState } from '../ui/empty-state'

interface ComprasTableProps {
  compras: Compra[]
  onAddClick: () => void
}

type SortDirection = 'asc' | 'desc'

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatAmount(amount: number, moneda: string): string {
  return amount.toLocaleString('es-AR', {
    style: 'currency',
    currency: moneda === 'USD' ? 'USD' : 'ARS',
  })
}

export function ComprasTable({ compras, onAddClick }: ComprasTableProps) {
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  function toggleSort() {
    setSortDir(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  const sorted = [...compras].sort((a, b) => {
    const cmp = a.fecha.localeCompare(b.fecha)
    return sortDir === 'desc' ? -cmp : cmp
  })

  if (compras.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="No hay compras registradas"
        description="Registrá tu primera compra de insumos para llevar un control preciso de tus gastos."
        action={{ label: 'Registrar compra', onClick: onAddClick }}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border-warm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-parchment border-b border-border-warm">
            <th className="text-left px-4 py-3 font-semibold text-text-dim">
              <button
                type="button"
                onClick={toggleSort}
                className="flex items-center gap-1 hover:text-field-green transition-colors"
              >
                Fecha
                <span className="text-text-muted text-xs">
                  {sortDir === 'desc' ? '↓' : '↑'}
                </span>
              </button>
            </th>
            <th className="text-left px-4 py-3 font-semibold text-text-dim">Proveedor</th>
            <th className="text-left px-4 py-3 font-semibold text-text-dim">Productos</th>
            <th className="text-right px-4 py-3 font-semibold text-text-dim">Total</th>
            <th className="text-center px-4 py-3 font-semibold text-text-dim">Moneda</th>
            <th className="text-left px-4 py-3 font-semibold text-text-dim">Factura</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((compra, i) => {
            const productosText = compra.items.map(it => it.productoName).join(', ')
            const isEven = i % 2 === 0

            return (
              <tr
                key={compra.id}
                className={`
                  border-b border-border-warm last:border-0
                  hover:bg-parchment transition-colors
                  ${isEven ? 'bg-surface' : 'bg-parchment/50'}
                `}
              >
                <td className="px-4 py-3 text-text-dim whitespace-nowrap">
                  {formatDate(compra.fecha)}
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {compra.proveedorName}
                </td>
                <td className="px-4 py-3 text-text-dim max-w-[240px] truncate" title={productosText}>
                  {productosText}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-text-primary whitespace-nowrap">
                  {formatAmount(compra.total, compra.moneda)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={compra.moneda === 'USD' ? 'usd' : 'ars'}>
                    {compra.moneda}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {compra.numeroFactura ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
