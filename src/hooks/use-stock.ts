import { useStockStore, getFilteredProductos, getStockAlerts } from '../stores/stock-store'

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

  const filteredProductos = useStockStore(getFilteredProductos)
  const stockAlerts = useStockStore(getStockAlerts)

  return {
    productos,
    movimientos,
    filteredProductos,
    stockAlerts,
    isLoading,
    error,
    filterCategoria,
    searchQuery,
    fetchStock,
    setFilterCategoria,
    setSearchQuery,
    clearError,
  }
}
