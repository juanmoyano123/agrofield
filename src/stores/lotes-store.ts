import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lote, LotesState, CreateLoteData, UpdateLoteData, LoteActividad } from '../types'
import { lotesApi } from '../lib/api-client'

interface LotesActions {
  fetchLotes: (tenantId: string) => Promise<void>
  createLote: (data: CreateLoteData, tenantId: string) => Promise<void>
  updateLote: (id: string, data: UpdateLoteData, tenantId: string) => Promise<void>
  deleteLote: (id: string, tenantId: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterActividad: (actividad: LoteActividad | '') => void
  setSortField: (field: 'nombre' | 'hectareas') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearError: () => void
  clearSuccessMessage: () => void
}

type LotesStore = LotesState & LotesActions

const initialState: LotesState = {
  lotes: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  searchQuery: '',
  filterActividad: '',
  sortField: 'nombre',
  sortOrder: 'asc',
}

export const useLotesStore = create<LotesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchLotes: async (tenantId) => {
        set({ isLoading: true, error: null })
        const response = await lotesApi.getLotes(tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar los lotes' })
          return
        }
        set({ lotes: response.data, isLoading: false })
      },

      createLote: async (data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await lotesApi.createLote(data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al crear el lote' })
          return
        }
        const { lotes } = get()
        set({
          lotes: [response.data, ...lotes],
          isSaving: false,
          successMessage: 'Lote creado exitosamente',
        })
      },

      updateLote: async (id, data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await lotesApi.updateLote(id, data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al actualizar el lote' })
          return
        }
        const { lotes } = get()
        const updated = response.data
        set({
          lotes: lotes.map(l => (l.id === id ? updated : l)),
          isSaving: false,
          successMessage: 'Lote actualizado exitosamente',
        })
      },

      deleteLote: async (id, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await lotesApi.deleteLote(id, tenantId)
        if (!response.success) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al eliminar el lote' })
          return
        }
        const { lotes } = get()
        // Remove from local state (soft delete — backend already marked deletedAt)
        set({
          lotes: lotes.filter(l => l.id !== id),
          isSaving: false,
          successMessage: 'Lote eliminado',
        })
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterActividad: (actividad) => set({ filterActividad: actividad }),
      setSortField: (field) => set({ sortField: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      clearError: () => set({ error: null }),
      clearSuccessMessage: () => set({ successMessage: null }),
    }),
    {
      name: 'agrofield-lotes',
      partialize: (state) => ({
        lotes: state.lotes as Lote[],
      }),
    },
  ),
)

/**
 * Returns filtered and sorted lotes based on current store state.
 * Call this as a derived selector, not as a store action.
 */
export function getFilteredAndSortedLotes(state: LotesStore): Lote[] {
  const { lotes, searchQuery, filterActividad, sortField, sortOrder } = state

  let result = lotes.filter(l => !l.deletedAt)

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter(
      l =>
        l.nombre.toLowerCase().includes(q) ||
        (l.ubicacion ?? '').toLowerCase().includes(q),
    )
  }

  if (filterActividad) {
    result = result.filter(l => l.actividad === filterActividad)
  }

  result = [...result].sort((a, b) => {
    let comparison = 0
    if (sortField === 'nombre') {
      comparison = a.nombre.localeCompare(b.nombre, 'es')
    } else if (sortField === 'hectareas') {
      comparison = a.hectareas - b.hectareas
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return result
}
