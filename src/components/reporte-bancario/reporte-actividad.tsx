/**
 * F-028: ReporteActividad — Productive activity summary.
 *
 * Shows event counts per type (siembra, aplicacion, cosecha, etc.)
 * and the total event count for the period. Demonstrates real field
 * activity to the lending institution.
 */

import type { ActividadResumen } from '../../lib/reporte-bancario-utils'

interface ReporteActividadProps {
  data: ActividadResumen
}

export function ReporteActividad({ data }: ReporteActividadProps) {
  const { items, totalEventos } = data

  if (items.length === 0) {
    return (
      <div className="reporte-section">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
          Actividad Productiva
        </h2>
        <p className="text-sm text-gray-500 py-4 text-center">
          Sin eventos registrados para el período seleccionado.
        </p>
      </div>
    )
  }

  return (
    <div className="reporte-section">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
        Actividad Productiva
      </h2>
      <div className="overflow-x-auto">
        <table className="reporte-table w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                Tipo de Actividad
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">
                Cantidad de eventos
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.tipo} className="even:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-gray-900">{item.label}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                  {item.cantidad}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 px-3 py-2 text-gray-900">TOTAL EVENTOS</td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">
                {totalEventos}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
