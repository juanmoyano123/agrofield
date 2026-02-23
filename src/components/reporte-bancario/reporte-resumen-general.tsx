/**
 * F-028: ReporteResumenGeneral — Executive summary with 4 top-level KPIs.
 *
 * Shows: total hectareas, active lotes count, total investment (ARS),
 * and average cost per hectare.
 */

import { formatCurrency, type ResumenGeneral } from '../../lib/reporte-bancario-utils'

interface ReporteResumenGeneralProps {
  data: ResumenGeneral
}

interface KpiCardProps {
  label: string
  value: string
  sublabel?: string
}

function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="border border-gray-200 rounded-sm p-4 bg-gray-50 text-center">
      <p className="text-2xl font-bold text-gray-900 font-display">{value}</p>
      <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wide">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  )
}

export function ReporteResumenGeneral({ data }: ReporteResumenGeneralProps) {
  const { totalHectareas, cantidadLotes, inversionTotal, costoPorHa } = data

  return (
    <div className="reporte-section">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest mb-3 border-b border-gray-300 pb-2">
        Resumen General
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Hectáreas operadas"
          value={totalHectareas.toLocaleString('es-AR')}
          sublabel="total del campo"
        />
        <KpiCard
          label="Lotes activos"
          value={cantidadLotes.toLocaleString('es-AR')}
          sublabel="unidades productivas"
        />
        <KpiCard
          label="Inversión total"
          value={formatCurrency(inversionTotal, 'ARS')}
          sublabel="compras + servicios ARS"
        />
        <KpiCard
          label="Costo por hectárea"
          value={formatCurrency(costoPorHa, 'ARS')}
          sublabel="promedio del período"
        />
      </div>
    </div>
  )
}
