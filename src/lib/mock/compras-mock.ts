import type { Compra, CompraFormData, CompraItem, NuevoProveedorData, Producto, Proveedor } from '../../types'
import type { ApiResponse } from '../../types'
import { randomDelay } from './delay'

// In-memory mutable arrays — filtered by tenantId at query time

const mockProveedores: Proveedor[] = [
  {
    id: 'prov-001',
    tenantId: 'tenant-demo-001',
    name: 'AgroInsumos SA',
    telefono: '+54 341 4123456',
    email: 'ventas@agroinsumos.com.ar',
    notas: null,
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'prov-002',
    tenantId: 'tenant-demo-001',
    name: 'La Rural Semillas',
    telefono: '+54 341 4987654',
    email: null,
    notas: 'Entrega en campo bajo pedido',
    createdAt: '2026-01-08T09:30:00.000Z',
  },
  {
    id: 'prov-003',
    tenantId: 'tenant-demo-001',
    name: 'Distribuidora Campo Verde',
    telefono: '+54 11 55234567',
    email: 'compras@campoverde.com.ar',
    notas: null,
    createdAt: '2026-01-12T10:00:00.000Z',
  },
]

const mockProductos: Producto[] = [
  {
    id: 'prod-001',
    tenantId: 'tenant-demo-001',
    name: 'Roundup 480',
    categoria: 'herbicida',
    unidad: 'Litros',
    precioPromedio: 4500,
    stockActual: 200,
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
    stockActual: 50,
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
]

const mockCompras: Compra[] = [
  {
    id: 'compra-001',
    tenantId: 'tenant-demo-001',
    proveedorId: 'prov-001',
    proveedorName: 'AgroInsumos SA',
    fecha: '2026-01-10',
    numeroFactura: 'FA-0001-00003421',
    total: 900000,
    moneda: 'ARS',
    notas: null,
    items: [
      {
        id: 'item-001',
        compraId: 'compra-001',
        productoId: 'prod-001',
        productoName: 'Roundup 480',
        cantidad: 200,
        unidad: 'Litros',
        precioUnitario: 4500,
        subtotal: 900000,
      },
    ],
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'compra-002',
    tenantId: 'tenant-demo-001',
    proveedorId: 'prov-002',
    proveedorName: 'La Rural Semillas',
    fecha: '2026-01-18',
    numeroFactura: null,
    total: 900000,
    moneda: 'ARS',
    notas: 'Pago contra entrega',
    items: [
      {
        id: 'item-002',
        compraId: 'compra-002',
        productoId: 'prod-002',
        productoName: 'Soja DM 4210',
        cantidad: 50,
        unidad: 'Bolsas',
        precioUnitario: 18000,
        subtotal: 900000,
      },
    ],
    createdAt: '2026-01-18T11:30:00.000Z',
  },
  {
    id: 'compra-003',
    tenantId: 'tenant-demo-001',
    proveedorId: 'prov-003',
    proveedorName: 'Distribuidora Campo Verde',
    fecha: '2026-02-05',
    numeroFactura: 'FB-0001-00001200',
    total: 4250000,
    moneda: 'ARS',
    notas: null,
    items: [
      {
        id: 'item-003',
        compraId: 'compra-003',
        productoId: 'prod-001',
        productoName: 'Roundup 480',
        cantidad: 100,
        unidad: 'Litros',
        precioUnitario: 4500,
        subtotal: 450000,
      },
      {
        id: 'item-004',
        compraId: 'compra-003',
        productoId: 'prod-003',
        productoName: 'Urea granulada',
        cantidad: 4500,
        unidad: 'Kilos',
        precioUnitario: 850,
        subtotal: 3825000,
      },
    ],
    createdAt: '2026-02-05T14:00:00.000Z',
  },
  {
    id: 'compra-004',
    tenantId: 'tenant-demo-001',
    proveedorId: 'prov-001',
    proveedorName: 'AgroInsumos SA',
    fecha: '2026-02-15',
    numeroFactura: 'FA-0001-00003498',
    total: 450000,
    moneda: 'ARS',
    notas: 'Reposicion urgente',
    items: [
      {
        id: 'item-005',
        compraId: 'compra-004',
        productoId: 'prod-001',
        productoName: 'Roundup 480',
        cantidad: 100,
        unidad: 'Litros',
        precioUnitario: 4500,
        subtotal: 450000,
      },
    ],
    createdAt: '2026-02-15T09:00:00.000Z',
  },
]

// --- Query functions ---

export async function mockGetCompras(tenantId: string): Promise<ApiResponse<Compra[]>> {
  await randomDelay()
  const result = mockCompras.filter(c => c.tenantId === tenantId)
  return { success: true, data: result }
}

export async function mockGetProveedores(tenantId: string): Promise<ApiResponse<Proveedor[]>> {
  await randomDelay()
  const result = mockProveedores.filter(p => p.tenantId === tenantId)
  return { success: true, data: result }
}

export async function mockGetProductos(tenantId: string): Promise<ApiResponse<Producto[]>> {
  await randomDelay()
  const result = mockProductos.filter(p => p.tenantId === tenantId)
  return { success: true, data: result }
}

export async function mockCreateCompra(
  data: CompraFormData,
  tenantId: string,
  resolvedProveedorId: string,
): Promise<ApiResponse<Compra>> {
  await randomDelay()

  const compraId = crypto.randomUUID()

  // Build items and calculate total
  const items: CompraItem[] = data.items.map((itemData, index) => {
    const subtotal = itemData.cantidad * itemData.precioUnitario

    // Find matching product to update stock — best effort, no error if not found
    const producto = mockProductos.find(
      p => p.tenantId === tenantId && p.name.toLowerCase() === itemData.productoName.toLowerCase()
    )

    let productoId: string
    if (producto) {
      // Update stock in memory
      producto.stockActual += itemData.cantidad
      productoId = producto.id
    } else {
      // Create a new product entry in memory
      productoId = crypto.randomUUID()
      const newProducto: Producto = {
        id: productoId,
        tenantId,
        name: itemData.productoName,
        categoria: null,
        unidad: itemData.unidad,
        precioPromedio: itemData.precioUnitario,
        stockActual: itemData.cantidad,
        moneda: data.moneda,
        createdAt: new Date().toISOString(),
      }
      mockProductos.push(newProducto)
    }

    return {
      id: `item-${compraId}-${index}`,
      compraId,
      productoId,
      productoName: itemData.productoName,
      cantidad: itemData.cantidad,
      unidad: itemData.unidad,
      precioUnitario: itemData.precioUnitario,
      subtotal,
    }
  })

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  // Resolve proveedor name: use existing if id provided, otherwise use form name
  const existingProv = mockProveedores.find(p => p.id === resolvedProveedorId)
  const proveedorName = existingProv ? existingProv.name : data.proveedorName

  const newCompra: Compra = {
    id: compraId,
    tenantId,
    proveedorId: resolvedProveedorId,
    proveedorName,
    fecha: data.fecha,
    numeroFactura: data.numeroFactura.trim() !== '' ? data.numeroFactura : null,
    total,
    moneda: data.moneda,
    notas: data.notas.trim() !== '' ? data.notas : null,
    items,
    createdAt: new Date().toISOString(),
  }

  mockCompras.push(newCompra)

  return { success: true, data: newCompra }
}

export async function mockCreateProveedor(
  data: NuevoProveedorData,
  tenantId: string,
): Promise<ApiResponse<Proveedor>> {
  await randomDelay()

  const newProveedor: Proveedor = {
    id: crypto.randomUUID(),
    tenantId,
    name: data.name,
    telefono: data.telefono.trim() !== '' ? data.telefono : null,
    email: null,
    notas: null,
    createdAt: new Date().toISOString(),
  }

  mockProveedores.push(newProveedor)

  return { success: true, data: newProveedor }
}
