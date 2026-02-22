import type { FinanceAlert } from '../../hooks/use-finance-alerts'

interface FinanceAlertsBannerProps {
  alerts: FinanceAlert[]
  onDismiss: (id: string) => void
}

/**
 * Displays a banner listing active finance alerts (gasto mensual, cashflow neto,
 * costo/ha por lote). Each chip includes a description and an X button to
 * individually dismiss that alert for the current session.
 *
 * Error-level alerts (gasto mensual excedido) render with a red palette.
 * Warning-level alerts (cashflow bajo, costo/ha alto) render with a yellow palette.
 * The banner is hidden when there are no active alerts.
 */
export function FinanceAlertsBanner({ alerts, onDismiss }: FinanceAlertsBannerProps) {
  if (alerts.length === 0) return null

  const errorAlerts = alerts.filter(a => a.tipo === 'error')
  const warningAlerts = alerts.filter(a => a.tipo === 'warning')

  return (
    <div className="flex flex-col gap-2">
      {errorAlerts.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm font-bold text-error mb-2">
            {errorAlerts.length} alerta{errorAlerts.length > 1 ? 's' : ''} de gasto excedido
          </p>
          <div className="flex flex-wrap gap-2">
            {errorAlerts.map(alert => (
              <span
                key={alert.id}
                className="inline-flex items-center gap-1.5 text-xs bg-white border border-red-200 text-error px-2 py-1 rounded-sm font-medium"
              >
                <span>{alert.mensaje}</span>
                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  aria-label={`Descartar alerta: ${alert.mensaje}`}
                  className="ml-0.5 text-error/60 hover:text-error transition-colors duration-200 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
          <p className="text-sm font-bold text-warning mb-2">
            ⚠ {warningAlerts.length} alerta{warningAlerts.length > 1 ? 's' : ''} financiera{warningAlerts.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {warningAlerts.map(alert => (
              <span
                key={alert.id}
                className="inline-flex items-center gap-1.5 text-xs bg-white border border-yellow-200 text-warning px-2 py-1 rounded-sm font-medium"
              >
                <span>⚠ {alert.mensaje}</span>
                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  aria-label={`Descartar alerta: ${alert.mensaje}`}
                  className="ml-0.5 text-warning/60 hover:text-warning transition-colors duration-200 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
