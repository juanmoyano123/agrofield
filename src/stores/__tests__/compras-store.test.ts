import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useComprasStore } from '../compras-store'

// Mock the entire api-client module so no real HTTP or mock delays run
vi.mock('../../lib/api-client', () => ({
  comprasApi: {
    getCompras: vi.fn(),
    createCompra: vi.fn(),
  },
  proveedoresApi: {
    getProveedores: vi.fn(),
    createProveedor: vi.fn(),
  },
  productosApi: {
    getProductos: vi.fn(),
  },
}))

import { comprasApi, proveedoresApi } from '../../lib/api-client'
import type { Compra, Proveedor } from '../../types'

const mockNewProveedor: Proveedor = {
  id: 'prov-new-001',
  tenantId: 'tenant-1',
  name: 'Nuevo Proveedor',
  telefono: null,
  email: null,
  notas: null,
  createdAt: '2026-02-01T00:00:00.000Z',
}

const mockCompra: Compra = {
  id: 'compra-001',
  tenantId: 'tenant-1',
  proveedorId: 'prov-001',
  proveedorName: 'AgroInsumos SA',
  fecha: '2026-02-21',
  numeroFactura: null,
  total: 450000,
  moneda: 'ARS',
  notas: null,
  items: [
    {
      id: 'item-001',
      compraId: 'compra-001',
      productoId: 'prod-001',
      productoName: 'Roundup 480',
      cantidad: 100,
      unidad: 'Litros',
      precioUnitario: 4500,
      subtotal: 450000,
    },
  ],
  createdAt: '2026-02-21T10:00:00.000Z',
}

const initialState = {
  compras: [],
  proveedores: [],
  productos: [],
  isLoading: false,
  isSaving: false,
  error: null,
}

beforeEach(() => {
  useComprasStore.setState(initialState)
  localStorage.clear()
  vi.clearAllMocks()
})

describe('fetchCompras', () => {
  it('sets compras on success', async () => {
    vi.mocked(comprasApi.getCompras).mockResolvedValueOnce({
      success: true,
      data: [mockCompra],
    })

    await useComprasStore.getState().fetchCompras('tenant-1')

    const state = useComprasStore.getState()
    expect(state.compras).toHaveLength(1)
    expect(state.compras[0]).toEqual(mockCompra)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    vi.mocked(comprasApi.getCompras).mockResolvedValueOnce({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error del servidor' },
    })

    await useComprasStore.getState().fetchCompras('tenant-1')

    const state = useComprasStore.getState()
    expect(state.compras).toHaveLength(0)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Error del servidor')
  })

  it('sets isLoading to true during fetch and false after', async () => {
    let resolvePromise!: (value: { success: true; data: Compra[] }) => void
    const promise = new Promise<{ success: true; data: Compra[] }>(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(comprasApi.getCompras).mockReturnValueOnce(promise)

    const fetchPromise = useComprasStore.getState().fetchCompras('tenant-1')
    expect(useComprasStore.getState().isLoading).toBe(true)

    resolvePromise({ success: true, data: [] })
    await fetchPromise

    expect(useComprasStore.getState().isLoading).toBe(false)
  })
})

describe('createCompra with existing proveedor', () => {
  it('creates compra without calling createProveedor when proveedorId is provided', async () => {
    vi.mocked(comprasApi.createCompra).mockResolvedValueOnce({
      success: true,
      data: mockCompra,
    })

    await useComprasStore.getState().createCompra(
      {
        proveedorId: 'prov-001',
        proveedorName: 'AgroInsumos SA',
        proveedorTelefono: '',
        fecha: '2026-02-21',
        numeroFactura: '',
        moneda: 'ARS',
        notas: '',
        items: [{ productoName: 'Roundup 480', cantidad: 100, unidad: 'Litros', precioUnitario: 4500 }],
      },
      'tenant-1',
    )

    expect(proveedoresApi.createProveedor).not.toHaveBeenCalled()
    expect(comprasApi.createCompra).toHaveBeenCalledWith(
      expect.objectContaining({ proveedorId: 'prov-001' }),
      'tenant-1',
      'prov-001',
    )

    const state = useComprasStore.getState()
    expect(state.compras).toHaveLength(1)
    expect(state.isSaving).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets error when createCompra API fails', async () => {
    vi.mocked(comprasApi.createCompra).mockResolvedValueOnce({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'No se pudo guardar' },
    })

    await useComprasStore.getState().createCompra(
      {
        proveedorId: 'prov-001',
        proveedorName: 'AgroInsumos SA',
        proveedorTelefono: '',
        fecha: '2026-02-21',
        numeroFactura: '',
        moneda: 'ARS',
        notas: '',
        items: [{ productoName: 'Roundup 480', cantidad: 100, unidad: 'Litros', precioUnitario: 4500 }],
      },
      'tenant-1',
    )

    const state = useComprasStore.getState()
    expect(state.error).toBe('No se pudo guardar')
    expect(state.isSaving).toBe(false)
  })
})

describe('createCompra with new proveedor', () => {
  it('calls createProveedor first when proveedorId is empty, then creates compra with new id', async () => {
    vi.mocked(proveedoresApi.createProveedor).mockResolvedValueOnce({
      success: true,
      data: mockNewProveedor,
    })

    const compraWithNewProv: Compra = {
      ...mockCompra,
      proveedorId: 'prov-new-001',
      proveedorName: 'Nuevo Proveedor',
    }
    vi.mocked(comprasApi.createCompra).mockResolvedValueOnce({
      success: true,
      data: compraWithNewProv,
    })

    await useComprasStore.getState().createCompra(
      {
        proveedorId: '',
        proveedorName: 'Nuevo Proveedor',
        proveedorTelefono: '+54 341 0000000',
        fecha: '2026-02-21',
        numeroFactura: '',
        moneda: 'ARS',
        notas: '',
        items: [{ productoName: 'Roundup 480', cantidad: 100, unidad: 'Litros', precioUnitario: 4500 }],
      },
      'tenant-1',
    )

    expect(proveedoresApi.createProveedor).toHaveBeenCalledWith(
      { name: 'Nuevo Proveedor', telefono: '+54 341 0000000' },
      'tenant-1',
    )
    expect(comprasApi.createCompra).toHaveBeenCalledWith(
      expect.any(Object),
      'tenant-1',
      'prov-new-001', // the ID returned from createProveedor
    )

    const state = useComprasStore.getState()
    expect(state.compras).toHaveLength(1)
    expect(state.proveedores).toHaveLength(1) // new proveedor added to store
    expect(state.proveedores[0]).toEqual(mockNewProveedor)
    expect(state.error).toBeNull()
  })

  it('stops and sets error when createProveedor fails', async () => {
    vi.mocked(proveedoresApi.createProveedor).mockResolvedValueOnce({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al crear proveedor' },
    })

    await useComprasStore.getState().createCompra(
      {
        proveedorId: '',
        proveedorName: 'Nuevo Proveedor',
        proveedorTelefono: '',
        fecha: '2026-02-21',
        numeroFactura: '',
        moneda: 'ARS',
        notas: '',
        items: [{ productoName: 'Roundup 480', cantidad: 100, unidad: 'Litros', precioUnitario: 4500 }],
      },
      'tenant-1',
    )

    expect(comprasApi.createCompra).not.toHaveBeenCalled()

    const state = useComprasStore.getState()
    expect(state.error).toBe('Error al crear proveedor')
    expect(state.isSaving).toBe(false)
    expect(state.compras).toHaveLength(0)
  })
})

describe('clearError', () => {
  it('resets error to null', () => {
    useComprasStore.setState({ error: 'Some error' })
    useComprasStore.getState().clearError()
    expect(useComprasStore.getState().error).toBeNull()
  })
})
