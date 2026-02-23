import type { Producto, ApiResponse } from '../../types'
import type { StockMovimiento, MotivoMovimiento } from '../../types'
import { randomDelay } from './delay'

// Shared mutable arrays — imported by compras-mock and eventos-mock
export const mockProductosDB: Producto[] = [
  {
    id: 'prod-001',
    tenantId: 'tenant-demo-001',
    name: 'Roundup 480',
    categoria: 'herbicida',
    unidad: 'Litros',
    precioPromedio: 4500,
    stockActual: 195,    // 200 comprado - 5 usado en evento-002
    moneda: 'ARS',
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'prod-002',
    tenantId: 'tenant-demo-001',
    name: 'Soja DM 4210',
    categoria: 'semilla',
    unidad: 'Bolsas',
    precioPromedio: 18000,
    stockActual: 20,     // 50 comprado - 30 usados en evento-001
    moneda: 'ARS',
    createdAt: '2026-01-08T09:30:00.000Z',
  },
  {
    id: 'prod-003',
    tenantId: 'tenant-demo-001',
    name: 'Urea granulada',
    categoria: 'fertilizante',
    unidad: 'Kilos',
    precioPromedio: 850,
    stockActual: 5000,
    moneda: 'ARS',
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'prod-004',
    tenantId: 'tenant-demo-001',
    name: 'Fungicida Score 250',
    categoria: 'insecticida',
    unidad: 'Litros',
    precioPromedio: 12000,
    stockActual: 8,
    moneda: 'ARS',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
]

const mockMovimientosDB: StockMovimiento[] = [
  {
    id: 'mov-001',
    tenantId: 'tenant-demo-001',
    productoId: 'prod-001',
    productoName: 'Roundup 480',
    tipo: 'entrada',
    motivo: 'compra',
    cantidad: 200,
    unidad: 'Litros',
    stockAntes: 0,
    stockDespues: 200,
    referenciaId: 'compra-001',
    referenciaLabel: 'Compra a AgroInsumos SA',
    fecha: '2026-01-10',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'mov-002',
    tenantId: 'tenant-demo-001',
    productoId: 'prod-002',
    productoName: 'Soja DM 4210',
    tipo: 'entrada',
    motivo: 'compra',
    cantidad: 50,
    unidad: 'Bolsas',
    stockAntes: 0,
    stockDespues: 50,
    referenciaId: 'compra-002',
    referenciaLabel: 'Compra a La Rural Semillas',
    fecha: '2026-01-18',
    createdAt: '2026-01-18T11:30:00.000Z',
  },
  {
    id: 'mov-003',
    tenantId: 'tenant-demo-001',
    productoId: 'prod-002',
    productoName: 'Soja DM 4210',
    tipo: 'salida',
    motivo: 'evento',
    cantidad: 30,
    unidad: 'Bolsas',
    stockAntes: 50,
    stockDespues: 20,
    referenciaId: 'evento-001',
    referenciaLabel: 'Siembra — Lote Norte',
    fecha: '2026-02-01',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'mov-004',
    tenantId: 'tenant-demo-001',
    productoId: 'prod-001',
    productoName: 'Roundup 480',
    tipo: 'salida',
    motivo: 'evento',
    cantidad: 5,
    unidad: 'Litros',
    stockAntes: 200,
    stockDespues: 195,
    referenciaId: 'evento-002',
    referenciaLabel: 'Aplicación — Lote Norte',
    fecha: '2026-02-10',
    createdAt: '2026-02-10T09:30:00.000Z',
  },
]

function generateId(): string {
  return `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

/**
 * Record a stock movement and update product stock in-place.
 * Called by compras-mock (entrada) and eventos-mock (salida).
 */
export function applyStockMovimiento(
  productoId: string,
  cantidad: number,       // positive = entrada, negative = salida
  motivo: MotivoMovimiento,
  referenciaId: string,
  referenciaLabel: string,
  fecha: string,
  tenantId: string,
): void {
  const producto = mockProductosDB.find(p => p.id === productoId && p.tenantId === tenantId)
  if (!producto) return

  const stockAntes = producto.stockActual
  producto.stockActual += cantidad
  const stockDespues = producto.stockActual

  mockMovimientosDB.push({
    id: generateId(),
    tenantId,
    productoId: producto.id,
    productoName: producto.name,
    tipo: cantidad >= 0 ? 'entrada' : 'salida',
    motivo,
    cantidad: Math.abs(cantidad),
    unidad: producto.unidad,
    stockAntes,
    stockDespues,
    referenciaId,
    referenciaLabel,
    fecha,
    createdAt: new Date().toISOString(),
  })
}

export async function mockGetProductos(tenantId: string): Promise<ApiResponse<Producto[]>> {
  await randomDelay()
  const result = mockProductosDB.filter(p => p.tenantId === tenantId)
  return { success: true, data: result }
}

export async function mockGetMovimientos(tenantId: string): Promise<ApiResponse<StockMovimiento[]>> {
  await randomDelay()
  const result = mockMovimientosDB
    .filter(m => m.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { success: true, data: result }
}

/**
 * Upsert a product (find by name or create new).
 * Returns the productoId.
 */
export function upsertProducto(
  name: string,
  unidad: string,
  precioUnitario: number,
  moneda: 'ARS' | 'USD',
  tenantId: string,
): string {
  const existing = mockProductosDB.find(
    p => p.tenantId === tenantId && p.name.toLowerCase() === name.toLowerCase(),
  )
  if (existing) {
    // Update precio promedio (simple average)
    existing.precioPromedio = Math.round((existing.precioPromedio + precioUnitario) / 2)
    return existing.id
  }
  const newId = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  mockProductosDB.push({
    id: newId,
    tenantId,
    name,
    categoria: null,
    unidad: unidad as Producto['unidad'],
    precioPromedio: precioUnitario,
    stockActual: 0,
    moneda,
    createdAt: new Date().toISOString(),
  })
  return newId
}
