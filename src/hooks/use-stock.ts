import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useStockStore, getFilteredProductos, getStockAlerts } from '../stores/stock-store'
import { useStockAlertsStore } from '../stores/stock-alerts-store'

export function useStock() {
  const productos = useStockStore(s => s.productos)
  const movimientos = useStockStore(s => s.movimientos)
  const isLoading = useStockStore(s => s.isLoading)
  const error = useStockStore(s => s.error)
  const filterCategoria = useStockStore(s => s.filterCategoria)
  const searchQuery = useStockStore(s => s.searchQuery)
  const fetchStock = useStockStore(s => s.fetchStock)
  const setFilterCategoria = useStockStore(s => s.setFilterCategoria)
  const setSearchQuery = useStockStore(s => s.setSearchQuery)
  const clearError = useStockStore(s => s.clearError)

  const filteredProductos = useStockStore(useShallow(getFilteredProductos))

  // Stock alerts store — thresholds are persisted, dismissedAlerts are session-only
  const thresholds = useStockAlertsStore(s => s.thresholds)
  const dismissedAlerts = useStockAlertsStore(s => s.dismissedAlerts)
  const dismissAlert = useStockAlertsStore(s => s.dismissAlert)
  const setThreshold = useStockAlertsStore(s => s.setThreshold)

  // Compute all products below threshold (uses configurable thresholds)
  const stockAlerts = useStockStore(useShallow(s => getStockAlerts(s, thresholds)))

  // Filter out alerts the user dismissed in this session
  const visibleAlerts = useMemo(
    () => stockAlerts.filter(p => !dismissedAlerts.includes(p.id)),
    [stockAlerts, dismissedAlerts]
  )

  return {
    productos,
    movimientos,
    filteredProductos,
    stockAlerts,
    visibleAlerts,
    thresholds,
    isLoading,
    error,
    filterCategoria,
    searchQuery,
    fetchStock,
    setFilterCategoria,
    setSearchQuery,
    clearError,
    dismissAlert,
    setThreshold,
  }
}
