/**
 * F-028: ReporteHeader — Cover section of the bank/credit report.
 *
 * Shows the field name, responsible person, emission date, and period.
 * Styled for both screen preview and print (A4 paper).
 */

interface ReporteHeaderProps {
  tenantName: string
  userName: string
  periodoLabel: string
}

export function ReporteHeader({ tenantName, userName, periodoLabel }: ReporteHeaderProps) {
  const fechaEmision = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="reporte-section border border-gray-300 rounded-sm p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display tracking-tight">
            REPORTE FINANCIERO PARA ENTIDADES CREDITICIAS
          </h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest">
            AgroField — Gestión Agropecuaria
          </p>
        </div>
        {/* AgroField logo mark — visible in both screen and print */}
        <div className="flex-shrink-0 border border-gray-300 w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7" className="stroke-gray-600" />
            <path d="M8 4v4l3 2" className="stroke-gray-600" />
            <circle cx="13" cy="3" r="1.5" className="fill-green-500 stroke-none" />
          </svg>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 font-medium uppercase tracking-wide text-xs">
            Campo / Establecimiento
          </span>
          <p className="text-gray-900 font-semibold mt-0.5">{tenantName || 'Sin nombre'}</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium uppercase tracking-wide text-xs">
            Responsable
          </span>
          <p className="text-gray-900 font-semibold mt-0.5">{userName || 'Sin nombre'}</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium uppercase tracking-wide text-xs">
            Período analizado
          </span>
          <p className="text-gray-900 font-semibold mt-0.5">{periodoLabel}</p>
        </div>
        <div>
          <span className="text-gray-500 font-medium uppercase tracking-wide text-xs">
            Fecha de emisión
          </span>
          <p className="text-gray-900 font-semibold mt-0.5">{fechaEmision}</p>
        </div>
      </div>
    </div>
  )
}
