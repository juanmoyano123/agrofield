import type { Proveedor, Compra } from '../../types'

interface ProveedorCardProps {
  proveedor: Proveedor
  compras: Compra[]
  onClick: (proveedor: Proveedor) => void
}

interface ProveedorStats {
  totalARS: number
  totalUSD: number
  cantidadCompras: number
  ultimaCompra: string | null
}

// eslint-disable-next-line react-refresh/only-export-components
export function computeProveedorStats(compras: Compra[], proveedorId: string): ProveedorStats {
  const propias = compras.filter(c => c.proveedorId === proveedorId)
  return {
    totalARS: propias.filter(c => c.moneda === 'ARS').reduce((s, c) => s + c.total, 0),
    totalUSD: propias.filter(c => c.moneda === 'USD').reduce((s, c) => s + c.total, 0),
    cantidadCompras: propias.length,
    ultimaCompra: propias.length > 0
      ? propias.sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha ?? null
      : null,
  }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value: number, moneda = 'ARS'): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  })
}

export function ProveedorCard({ proveedor, compras, onClick }: ProveedorCardProps) {
  const stats = computeProveedorStats(compras, proveedor.id)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(proveedor)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(proveedor)}
      className="
        bg-surface border border-border-warm border-l-2 border-l-copper rounded-sm
        shadow-warm-sm hover:shadow-warm hover:-translate-y-0.5
        transition-all duration-300 p-4 cursor-pointer
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{proveedor.name}</h3>
          {proveedor.telefono && (
            <p className="text-xs text-text-muted mt-0.5">{proveedor.telefono}</p>
          )}
        </div>
        <span className="
          shrink-0 text-xs font-bold px-2 py-1 rounded-sm
          bg-parchment text-text-dim border border-border-warm
        ">
          {stats.cantidadCompras} {stats.cantidadCompras === 1 ? 'compra' : 'compras'}
        </span>
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-1 mb-3">
        {stats.totalARS > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Total ARS</span>
            <span className="text-base font-bold text-text-primary">{formatCurrency(stats.totalARS)}</span>
          </div>
        )}
        {stats.totalUSD > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Total USD</span>
            <span className="text-base font-bold text-text-primary">{formatCurrency(stats.totalUSD, 'USD')}</span>
          </div>
        )}
        {stats.totalARS === 0 && stats.totalUSD === 0 && (
          <p className="text-xs text-text-muted italic">Sin compras registradas</p>
        )}
      </div>

      {/* Last purchase */}
      {stats.ultimaCompra && (
        <div className="flex items-center justify-between pt-2 border-t border-border-warm">
          <span className="text-xs text-text-muted">Última compra</span>
          <span className="text-xs font-medium text-text-dim">{formatDate(stats.ultimaCompra)}</span>
        </div>
      )}
    </div>
  )
}
