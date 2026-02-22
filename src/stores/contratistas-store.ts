import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrabajosState, TrabajoContratista, Contratista, CreateTrabajoData, UpdateTrabajoData } from '../types'
import { trabajosApi, contratistasApi } from '../lib/api-client'

interface TrabajosActions {
  fetchTrabajos: (tenantId: string) => Promise<void>
  fetchContratistas: (tenantId: string) => Promise<void>
  createTrabajo: (data: CreateTrabajoData, tenantId: string) => Promise<void>
  updateTrabajo: (id: string, data: UpdateTrabajoData, tenantId: string) => Promise<void>
  deleteTrabajo: (id: string, tenantId: string) => Promise<void>
  createContratista: (nombre: string, tenantId: string) => Promise<Contratista | null>
  setFilterContratista: (contratistaId: string) => void
  setFilterLote: (loteId: string) => void
  setFilterFechaDesde: (fecha: string) => void
  setFilterFechaHasta: (fecha: string) => void
  clearError: () => void
  clearSuccessMessage: () => void
}

type TrabajosStore = TrabajosState & TrabajosActions

const initialState: TrabajosState = {
  trabajos: [],
  contratistas: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  filterContratista: '',
  filterLote: '',
  filterFechaDesde: '',
  filterFechaHasta: '',
}

export const useTrabajosStore = create<TrabajosStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchTrabajos: async (tenantId) => {
        set({ isLoading: true, error: null })
        const response = await trabajosApi.getTrabajos(tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar los trabajos' })
          return
        }
        set({ trabajos: response.data, isLoading: false })
      },

      fetchContratistas: async (tenantId) => {
        const response = await contratistasApi.getContratistas(tenantId)
        if (!response.success || !response.data) {
          return
        }
        set({ contratistas: response.data })
      },

      createTrabajo: async (data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await trabajosApi.createTrabajo(data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al registrar el trabajo' })
          return
        }
        const { trabajos } = get()
        set({
          trabajos: [response.data, ...trabajos],
          isSaving: false,
          successMessage: 'Trabajo registrado exitosamente',
        })
      },

      updateTrabajo: async (id, data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await trabajosApi.updateTrabajo(id, data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al actualizar el trabajo' })
          return
        }
        const { trabajos } = get()
        const updated = response.data
        set({
          trabajos: trabajos.map(t => (t.id === id ? updated : t)),
          isSaving: false,
          successMessage: 'Trabajo actualizado exitosamente',
        })
      },

      deleteTrabajo: async (id, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await trabajosApi.deleteTrabajo(id, tenantId)
        if (!response.success) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al eliminar el trabajo' })
          return
        }
        const { trabajos } = get()
        set({
          trabajos: trabajos.filter(t => t.id !== id),
          isSaving: false,
          successMessage: 'Trabajo eliminado',
        })
      },

      createContratista: async (nombre, tenantId) => {
        const response = await contratistasApi.createContratista(nombre, tenantId)
        if (!response.success || !response.data) {
          return null
        }
        const { contratistas } = get()
        set({ contratistas: [...contratistas, response.data] })
        return response.data
      },

      setFilterContratista: (contratistaId) => set({ filterContratista: contratistaId }),
      setFilterLote: (loteId) => set({ filterLote: loteId }),
      setFilterFechaDesde: (fecha) => set({ filterFechaDesde: fecha }),
      setFilterFechaHasta: (fecha) => set({ filterFechaHasta: fecha }),
      clearError: () => set({ error: null }),
      clearSuccessMessage: () => set({ successMessage: null }),
    }),
    {
      name: 'agrofield-trabajos',
      partialize: (state) => ({
        trabajos: state.trabajos as TrabajoContratista[],
        contratistas: state.contratistas as Contratista[],
      }),
    },
  ),
)

/**
 * Returns filtered trabajos based on current store state.
 * Filters out soft-deleted records and applies contratista, lote, and date filters.
 * Results are sorted descending by fecha.
 */
export function getFilteredTrabajos(state: TrabajosStore): TrabajoContratista[] {
  const { trabajos, filterContratista, filterLote, filterFechaDesde, filterFechaHasta } = state

  let result = trabajos.filter(t => !t.deletedAt)

  if (filterContratista) {
    result = result.filter(t => t.contratistaId === filterContratista)
  }

  if (filterLote) {
    result = result.filter(t => t.loteId === filterLote)
  }

  if (filterFechaDesde) {
    result = result.filter(t => t.fecha >= filterFechaDesde)
  }

  if (filterFechaHasta) {
    result = result.filter(t => t.fecha <= filterFechaHasta)
  }

  // Sort descending by fecha (most recent first)
  return [...result].sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/**
 * Returns total cost of the currently filtered trabajos.
 */
export function getTotalGastos(state: TrabajosStore): number {
  return getFilteredTrabajos(state).reduce((sum, t) => sum + t.costo, 0)
}
