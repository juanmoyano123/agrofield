import { useComprasStore } from '../stores/compras-store'

export function useCompras() {
  const compras = useComprasStore(s => s.compras)
  const proveedores = useComprasStore(s => s.proveedores)
  const productos = useComprasStore(s => s.productos)
  const isLoading = useComprasStore(s => s.isLoading)
  const isSaving = useComprasStore(s => s.isSaving)
  const error = useComprasStore(s => s.error)
  const fetchCompras = useComprasStore(s => s.fetchCompras)
  const fetchProveedores = useComprasStore(s => s.fetchProveedores)
  const fetchProductos = useComprasStore(s => s.fetchProductos)
  const createCompra = useComprasStore(s => s.createCompra)
  const clearError = useComprasStore(s => s.clearError)

  return {
    compras,
    proveedores,
    productos,
    isLoading,
    isSaving,
    error,
    fetchCompras,
    fetchProveedores,
    fetchProductos,
    createCompra,
    clearError,
  }
}
