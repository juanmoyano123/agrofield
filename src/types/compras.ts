export type Moneda = 'ARS' | 'USD'

export type UnidadMedida = 'Litros' | 'Kilos' | 'Unidades' | 'Bolsas' | 'Toneladas'

export type CategoriaProducto = 'semilla' | 'herbicida' | 'insecticida' | 'fertilizante' | 'otro'

export interface Proveedor {
  id: string
  tenantId: string
  name: string
  telefono: string | null
  email: string | null
  notas: string | null
  createdAt: string
}

export interface Producto {
  id: string
  tenantId: string
  name: string
  categoria: CategoriaProducto | null
  unidad: UnidadMedida
  precioPromedio: number
  stockActual: number
  moneda: Moneda
  createdAt: string
}

export interface CompraItem {
  id: string
  compraId: string
  productoId: string
  productoName: string
  cantidad: number
  unidad: UnidadMedida
  precioUnitario: number
  subtotal: number
}

export interface Compra {
  id: string
  tenantId: string
  proveedorId: string
  proveedorName: string
  fecha: string
  numeroFactura: string | null
  total: number
  moneda: Moneda
  notas: string | null
  items: CompraItem[]
  createdAt: string
}

export interface LoteMock {
  id: string
  name: string
  superficie: number
}

export interface ComprasState {
  compras: Compra[]
  proveedores: Proveedor[]
  productos: Producto[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export interface CompraItemFormData {
  productoName: string
  cantidad: number
  unidad: UnidadMedida
  precioUnitario: number
}

export interface CompraFormData {
  proveedorId: string
  proveedorName: string
  proveedorTelefono: string
  fecha: string
  numeroFactura: string
  moneda: Moneda
  notas: string
  items: CompraItemFormData[]
}

export interface NuevoProveedorData {
  name: string
  telefono: string
}
