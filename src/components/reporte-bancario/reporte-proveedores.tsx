/**
 * F-028: ReporteProveedores — Top 10 suppliers by total spend.
 *
 * Columns: Proveedor | Cantidad de compras | Gasto Total ARS | % del total
 * Sorted descending by gasto total. Reuses computeGastoPorProveedor data.
 */

import { formatCurrency } from '../../lib/reporte-bancario-utils'
import type { ProveedorGastoItem } from '../../lib/dashboard-utils'

interface ReporteProveedoresProps {
  items: ProveedorGastoItem[]
}

export function ReporteProveedores({ items }: ReporteProveedoresProps) {
  const top10 = items.slice(0, 10)

  if (top10.length === 0) {
    return (
      <div className="reporte-section">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
          Principales Proveedores
        </h2>
        <p className="text-sm text-gray-500 py-4 text-center">
          Sin compras registradas para el período seleccionado.
        </p>
      </div>
    )
  }

  const totalARS = top10.reduce((sum, p) => sum + p.totalARS, 0)

  return (
    <div className="reporte-section">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
        Principales Proveedores
      </h2>
      <div className="overflow-x-auto">
        <table className="reporte-table w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Proveedor</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Compras</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Gasto Total ARS</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">% del Total</th>
            </tr>
          </thead>
          <tbody>
            {top10.map(p => (
              <tr key={p.proveedorId} className="even:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-gray-900">{p.proveedorName}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {p.cantidadCompras}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(p.totalARS, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {p.porcentaje.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          {top10.length > 1 && (
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2 text-gray-900">
                  TOTAL ({top10.length} proveedores)
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                  {top10.reduce((s, p) => s + p.cantidadCompras, 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                  {formatCurrency(totalARS, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                  100%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
