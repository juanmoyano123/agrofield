import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Compra, CompraFormData, ComprasState, Proveedor, Producto } from '../types'
import { comprasApi, proveedoresApi, productosApi } from '../lib/api-client'

interface ComprasActions {
  fetchCompras: (tenantId: string) => Promise<void>
  fetchProveedores: (tenantId: string) => Promise<void>
  fetchProductos: (tenantId: string) => Promise<void>
  createCompra: (data: CompraFormData, tenantId: string) => Promise<void>
  clearError: () => void
}

type ComprasStore = ComprasState & ComprasActions

const initialState: ComprasState = {
  compras: [],
  proveedores: [],
  productos: [],
  isLoading: false,
  isSaving: false,
  error: null,
}

export const useComprasStore = create<ComprasStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchCompras: async (tenantId) => {
        set({ isLoading: true, error: null })
        const response = await comprasApi.getCompras(tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar las compras' })
          return
        }
        set({ compras: response.data, isLoading: false })
      },

      fetchProveedores: async (tenantId) => {
        const response = await proveedoresApi.getProveedores(tenantId)
        if (!response.success || !response.data) {
          return
        }
        set({ proveedores: response.data })
      },

      fetchProductos: async (tenantId) => {
        const response = await productosApi.getProductos(tenantId)
        if (!response.success || !response.data) {
          return
        }
        set({ productos: response.data })
      },

      createCompra: async (data, tenantId) => {
        set({ isSaving: true, error: null })

        // If no existing proveedor selected, create a new one first
        let resolvedProveedorId = data.proveedorId

        if (data.proveedorId === '' && data.proveedorName.trim() !== '') {
          const provResponse = await proveedoresApi.createProveedor(
            { name: data.proveedorName, telefono: data.proveedorTelefono },
            tenantId,
          )
          if (!provResponse.success || !provResponse.data) {
            set({
              isSaving: false,
              error: provResponse.error?.message ?? 'Error al crear el proveedor',
            })
            return
          }
          resolvedProveedorId = provResponse.data.id
          // Add the new proveedor to local state
          const { proveedores } = get()
          set({ proveedores: [...proveedores, provResponse.data] })
        }

        const response = await comprasApi.createCompra(data, tenantId, resolvedProveedorId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al guardar la compra' })
          return
        }

        const { compras } = get()
        set({
          compras: [response.data, ...compras],
          isSaving: false,
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'agrofield-compras',
      partialize: (state) => ({
        compras: state.compras as Compra[],
        proveedores: state.proveedores as Proveedor[],
        productos: state.productos as Producto[],
      }),
    },
  ),
)
