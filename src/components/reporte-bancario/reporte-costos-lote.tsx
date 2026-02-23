/**
 * F-028: ReporteCostosLote — Cost breakdown table per lot.
 *
 * Reuses computeCostosAllLotesByPeriod (dashboard-utils) data.
 * Columns: Lote | Hectáreas | Costo Eventos | Costo Servicios | Total | $/ha
 * Includes a totals row. Sorted by costo total descending.
 */

import { formatCurrency } from '../../lib/reporte-bancario-utils'
import type { CostoLoteRow } from '../../lib/dashboard-utils'

interface ReporteCostosLoteProps {
  rows: CostoLoteRow[]
}

export function ReporteCostosLote({ rows }: ReporteCostosLoteProps) {
  if (rows.length === 0) {
    return (
      <div className="reporte-section">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
          Costos por Lote
        </h2>
        <p className="text-sm text-gray-500 py-4 text-center">
          Sin costos registrados para el período seleccionado.
        </p>
      </div>
    )
  }

  // Sort descending by costoTotal (computeCostosAllLotesByPeriod sorts by costoPorHa,
  // but for the report we prefer total cost order)
  const sorted = [...rows].sort((a, b) => b.costoTotal - a.costoTotal)

  const totals = sorted.reduce(
    (acc, r) => ({
      hectareas: acc.hectareas + r.hectareas,
      costoEventos: acc.costoEventos + r.costoEventos,
      costoTrabajos: acc.costoTrabajos + r.costoTrabajos,
      costoTotal: acc.costoTotal + r.costoTotal,
    }),
    { hectareas: 0, costoEventos: 0, costoTrabajos: 0, costoTotal: 0 },
  )

  const totalCostoPorHa = totals.hectareas > 0
    ? Math.round(totals.costoTotal / totals.hectareas)
    : 0

  return (
    <div className="reporte-section">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
        Costos por Lote
      </h2>
      <div className="overflow-x-auto">
        <table className="reporte-table w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Lote</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Has.</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Costo Eventos</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Costo Servicios</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">Total</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">$/ha</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.loteId} className="even:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-gray-900">{row.nombre}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {row.hectareas.toLocaleString('es-AR')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(row.costoEventos, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(row.costoTrabajos, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                  {formatCurrency(row.costoTotal, 'ARS')}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {formatCurrency(row.costoPorHa, 'ARS')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 px-3 py-2 text-gray-900">TOTALES</td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {totals.hectareas.toLocaleString('es-AR')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totals.costoEventos, 'ARS')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totals.costoTrabajos, 'ARS')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totals.costoTotal, 'ARS')}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {formatCurrency(totalCostoPorHa, 'ARS')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
