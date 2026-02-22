export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'
export type MotivoMovimiento = 'compra' | 'evento' | 'ajuste_manual'

export interface StockMovimiento {
  id: string
  tenantId: string
  productoId: string
  productoName: string
  tipo: TipoMovimiento
  motivo: MotivoMovimiento
  cantidad: number
  unidad: string
  stockAntes: number
  stockDespues: number
  referenciaId: string
  referenciaLabel: string
  fecha: string
  createdAt: string
}

export interface StockState {
  productos: import('./compras').Producto[]
  movimientos: StockMovimiento[]
  isLoading: boolean
  error: string | null
  filterCategoria: import('./compras').CategoriaProducto | ''
  searchQuery: string
}
