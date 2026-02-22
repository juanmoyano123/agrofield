import { create } from 'zustand'
import type { Producto, StockMovimiento, StockState, CategoriaProducto } from '../types'
import { productosApi } from '../lib/api-client'

interface StockActions {
  fetchStock: (tenantId: string) => Promise<void>
  setFilterCategoria: (categoria: CategoriaProducto | '') => void
  setSearchQuery: (query: string) => void
  clearError: () => void
}

type StockStore = StockState & StockActions

const initialState: StockState = {
  productos: [],
  movimientos: [],
  isLoading: false,
  error: null,
  filterCategoria: '',
  searchQuery: '',
}

export const useStockStore = create<StockStore>()((set) => ({
  ...initialState,

  fetchStock: async (tenantId) => {
    set({ isLoading: true, error: null })
    const [productosRes, movimientosRes] = await Promise.all([
      productosApi.getProductos(tenantId),
      productosApi.getMovimientos(tenantId),
    ])
    if (!productosRes.success) {
      set({ isLoading: false, error: productosRes.error?.message ?? 'Error al cargar el stock' })
      return
    }
    set({
      productos: productosRes.data ?? [],
      movimientos: movimientosRes.success ? (movimientosRes.data ?? []) : [],
      isLoading: false,
    })
  },

  setFilterCategoria: (categoria) => set({ filterCategoria: categoria }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
}))

export function getFilteredProductos(state: StockStore): Producto[] {
  const { productos, filterCategoria, searchQuery } = state

  let result = [...productos]

  if (filterCategoria) {
    result = result.filter(p => p.categoria === filterCategoria)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }

  return result.sort((a, b) => {
    // Sort: negative stock first, then low stock, then normal
    if (a.stockActual < 0 && b.stockActual >= 0) return -1
    if (b.stockActual < 0 && a.stockActual >= 0) return 1
    return a.name.localeCompare(b.name, 'es')
  })
}

export function getStockAlerts(state: StockStore): Producto[] {
  return state.productos.filter(p => p.stockActual <= 10 && p.stockActual >= 0)
}

export function getMovimientosByProducto(state: StockStore, productoId: string): StockMovimiento[] {
  return state.movimientos.filter(m => m.productoId === productoId)
}
