import { useMemo } from 'react'
import { useStockStore } from '../stores/stock-store'
import { useStockAlertsStore } from '../stores/stock-alerts-store'

/**
 * Returns the number of products currently below their configured threshold.
 * Used by the nav badge in AppLayout to show a count without subscribing
 * to the full stock hook.
 */
export function useStockAlertCount(): number {
  const productos = useStockStore(s => s.productos)
  const thresholds = useStockAlertsStore(s => s.thresholds)

  return useMemo(
    () =>
      productos.filter(
        p => p.stockActual <= (thresholds[p.id] ?? 10) && p.stockActual >= 0
      ).length,
    [productos, thresholds]
  )
}
