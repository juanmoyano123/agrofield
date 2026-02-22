import type { ProveedorGastoItem } from '../../lib/dashboard-utils'

interface GastoProveedorTableProps {
  data: ProveedorGastoItem[]
  totalGasto: number
  moneda: 'ARS' | 'USD'
}

function formatCurrency(value: number, moneda: 'ARS' | 'USD'): string {
  const prefix = moneda === 'ARS' ? '$' : 'USD '
  return prefix + value.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export function GastoProveedorTable({ data, totalGasto, moneda }: GastoProveedorTableProps) {
  if (data.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-warm">
            <th className="py-2 px-3 text-left font-semibold text-text-muted w-8">#</th>
            <th className="py-2 px-3 text-left font-semibold text-text-muted">Proveedor</th>
            <th className="py-2 px-3 text-right font-semibold text-text-muted">Monto</th>
            <th className="py-2 px-3 text-right font-semibold text-text-muted hidden sm:table-cell">
              % del total
            </th>
            <th className="py-2 px-3 text-right font-semibold text-text-muted hidden sm:table-cell">
              Compras
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const monto = moneda === 'ARS' ? item.totalARS : item.totalUSD
            const isTopSupplier = index === 0
            return (
              <tr
                key={item.proveedorId}
                className="border-b border-border-warm last:border-0 hover:bg-parchment transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span
                    className={[
                      'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                      isTopSupplier
                        ? 'bg-field-green text-white'
                        : 'bg-parchment text-text-muted',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-text-primary font-medium">{item.proveedorName}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-text-primary">
                  {formatCurrency(monto, moneda)}
                </td>
                <td className="py-2.5 px-3 text-right text-text-dim hidden sm:table-cell">
                  {/* Percentage is always relative to ARS total */}
                  {item.porcentaje > 0 ? `${item.porcentaje.toFixed(1)}%` : '—'}
                </td>
                <td className="py-2.5 px-3 text-right text-text-muted hidden sm:table-cell">
                  {item.cantidadCompras}
                </td>
              </tr>
            )
          })}
        </tbody>
        {totalGasto > 0 && (
          <tfoot>
            <tr className="border-t-2 border-border-warm">
              <td colSpan={2} className="py-2.5 px-3 text-right font-semibold text-text-dim text-xs">
                Total
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-text-primary">
                {formatCurrency(totalGasto, moneda)}
              </td>
              <td colSpan={2} className="hidden sm:table-cell" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
