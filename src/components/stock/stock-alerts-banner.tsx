import type { Producto } from '../../types'

interface StockAlertsBannerProps {
  alerts: Producto[]
  onDismiss: (productoId: string) => void
}

/**
 * Displays a banner listing products that are at or below their stock threshold.
 * Each chip shows the product name, current stock, and unit, with an X button
 * to individually dismiss that alert for the current session.
 * The banner is hidden when there are no active (non-dismissed) alerts.
 */
export function StockAlertsBanner({ alerts, onDismiss }: StockAlertsBannerProps) {
  if (alerts.length === 0) return null

  return (
    <div className="p-3 bg-[#FBF3E0] border border-warning/40 rounded-sm">
      <p className="text-sm font-bold text-warning mb-2">
        ⚠ {alerts.length} producto{alerts.length > 1 ? 's' : ''} con stock bajo
      </p>
      <div className="flex flex-wrap gap-2">
        {alerts.map(p => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1.5 text-xs bg-white border border-warning/30 text-warning px-2 py-1 rounded-sm font-medium"
          >
            <span>⚠ {p.name}: {p.stockActual} {p.unidad}</span>
            <button
              type="button"
              onClick={() => onDismiss(p.id)}
              aria-label={`Descartar alerta de ${p.name}`}
              className="ml-0.5 text-warning/60 hover:text-warning transition-colors duration-200 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
