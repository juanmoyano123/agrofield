/**
 * F-028: ReporteCashflow — Monthly cashflow summary table.
 *
 * Displays egresos (compras + servicios) per month as a table.
 * Tables print better than charts on paper. Uses computeCashflow data.
 * Includes a totals row at the bottom.
 */

import { formatCurrency } from '../../lib/reporte-bancario-utils'
import type { CashflowSummary } from '../../lib/dashboard-utils'

interface ReporteCashflowProps {
  data: CashflowSummary
}

export function ReporteCashflow({ data }: ReporteCashflowProps) {
  const { mensual, totalEgresosCompras, totalEgresosTrabajos, totalEgresos } = data

  if (mensual.length === 0) {
    return (
      <div className="reporte-section">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
          Cashflow del Período
        </h2>
        <p className="text-sm text-gray-500 py-4 text-center">
          Sin movimientos registrados para el período seleccionado.
        </p>
      </div>
    )
  }

  return (
    <div className="reporte-section">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
        Cashflow del Período
      </h2>
      <div className="overflow-x-auto">
        <table className="reporte-table w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Mes</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Egresos Compras</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Egresos Servicios</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Total Egresos</th>
            </tr>
          </thead>
          <tbody>
            {mensual.map(m => (
              <tr key={m.mesKey} className="even:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-gray-900">{m.mes}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(m.egresosCompras, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(m.egresosTrabajos, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                  {formatCurrency(m.egresosTotal, 'ARS')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 px-3 py-2 text-gray-900">TOTAL</td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totalEgresosCompras, 'ARS')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totalEgresosTrabajos, 'ARS')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totalEgresos, 'ARS')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
