import type { Proveedor, Compra } from '../../types'
import { Modal } from '../ui/modal'
import { computeProveedorStats } from './proveedor-card'

interface ProveedorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  proveedor: Proveedor | null
  compras: Compra[]
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(value: number, moneda = 'ARS'): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
}

export function ProveedorDetailModal({ isOpen, onClose, proveedor, compras }: ProveedorDetailModalProps) {
  if (!proveedor) return null

  const proveedorCompras = compras
    .filter(c => c.proveedorId === proveedor.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const stats = computeProveedorStats(compras, proveedor.id)
  const promedioCompra = stats.cantidadCompras > 0
    ? Math.round(stats.totalARS / stats.cantidadCompras)
    : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={proveedor.name} size="md">
      <div className="flex flex-col gap-5">

        {/* Info general */}
        <div className="flex flex-col gap-2 p-3 bg-parchment rounded-sm border border-border-warm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-1">
            Información de contacto
          </p>
          {proveedor.telefono ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Teléfono</span>
              <a href={`tel:${proveedor.telefono}`} className="font-medium text-text-dim hover:text-field-green transition-colors">
                {proveedor.telefono}
              </a>
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">Sin datos de contacto</p>
          )}
          {proveedor.notas && (
            <div className="text-sm text-text-dim border-l-2 border-border-warm pl-2 mt-1">
              {proveedor.notas}
            </div>
          )}
        </div>

        {/* Resumen */}
        {stats.cantidadCompras > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-surface rounded-sm border border-border-warm text-center">
              <p className="text-xs text-text-muted mb-1">Compras</p>
              <p className="text-xl font-bold text-text-primary">{stats.cantidadCompras}</p>
            </div>
            {stats.totalARS > 0 && (
              <div className="p-3 bg-surface rounded-sm border border-border-warm text-center">
                <p className="text-xs text-text-muted mb-1">Total ARS</p>
                <p className="text-base font-bold text-text-primary">{formatCurrency(stats.totalARS)}</p>
              </div>
            )}
            {stats.totalUSD > 0 && (
              <div className="p-3 bg-surface rounded-sm border border-border-warm text-center">
                <p className="text-xs text-text-muted mb-1">Total USD</p>
                <p className="text-base font-bold text-text-primary">{formatCurrency(stats.totalUSD, 'USD')}</p>
              </div>
            )}
            {promedioCompra > 0 && (
              <div className="p-3 bg-surface rounded-sm border border-border-warm text-center">
                <p className="text-xs text-text-muted mb-1">Promedio/compra</p>
                <p className="text-base font-bold text-text-primary">{formatCurrency(promedioCompra)}</p>
              </div>
            )}
          </div>
        )}

        {/* Historial */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
            Historial de compras
          </p>

          {proveedorCompras.length === 0 ? (
            <p className="text-sm text-text-muted italic py-4 text-center">
              Sin compras registradas para este proveedor.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {proveedorCompras.map(compra => (
                <div
                  key={compra.id}
                  className="p-3 bg-surface rounded-sm border border-border-warm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-text-muted">
                      {formatDate(compra.fecha)}
                    </span>
                    <span className="text-sm font-bold text-text-primary whitespace-nowrap">
                      {formatCurrency(compra.total, compra.moneda)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {compra.items.map(item => (
                      <p key={item.id} className="text-xs text-text-dim">
                        {item.productoName} — {item.cantidad} {item.unidad}
                      </p>
                    ))}
                  </div>
                  {compra.numeroFactura && (
                    <p className="text-xs text-text-muted mt-1.5">
                      Factura: {compra.numeroFactura}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
