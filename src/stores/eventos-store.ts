import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Evento, EventosState, CreateEventoData, UpdateEventoData, TipoEvento } from '../types'
import { eventosApi } from '../lib/api-client'

interface EventosActions {
  fetchEventos: (loteId: string, tenantId: string) => Promise<void>
  /** F-005: Fetch all eventos across all lotes for a tenant (used by imputacion engine) */
  fetchAllEventos: (tenantId: string) => Promise<void>
  createEvento: (data: CreateEventoData, loteId: string, tenantId: string) => Promise<void>
  updateEvento: (id: string, data: UpdateEventoData, tenantId: string) => Promise<void>
  deleteEvento: (id: string, tenantId: string) => Promise<void>
  setFilterTipo: (tipo: TipoEvento | '') => void
  setFilterFechaDesde: (fecha: string) => void
  setFilterFechaHasta: (fecha: string) => void
  clearFilters: () => void
  clearError: () => void
  clearSuccessMessage: () => void
}

type EventosStore = EventosState & EventosActions

const initialState: EventosState = {
  eventos: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  filterTipo: '',
  filterFechaDesde: '',
  filterFechaHasta: '',
}

export const useEventosStore = create<EventosStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchEventos: async (loteId, tenantId) => {
        set({ isLoading: true, error: null })
        const response = await eventosApi.getEventosByLote(loteId, tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar los eventos' })
          return
        }
        set({ eventos: response.data, isLoading: false })
      },

      // F-005: Load all eventos for the tenant to power the imputacion engine
      fetchAllEventos: async (tenantId) => {
        set({ isLoading: true, error: null })
        const response = await eventosApi.getAllEventos(tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar eventos' })
          return
        }
        set({ eventos: response.data, isLoading: false })
      },

      createEvento: async (data, loteId, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await eventosApi.createEvento(data, loteId, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al registrar el evento' })
          return
        }
        const { eventos } = get()
        set({
          eventos: [response.data, ...eventos],
          isSaving: false,
          successMessage: 'Evento registrado exitosamente',
        })
      },

      updateEvento: async (id, data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await eventosApi.updateEvento(id, data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al actualizar el evento' })
          return
        }
        const { eventos } = get()
        const updated = response.data
        set({
          eventos: eventos.map(e => (e.id === id ? updated : e)),
          isSaving: false,
          successMessage: 'Evento actualizado exitosamente',
        })
      },

      deleteEvento: async (id, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await eventosApi.deleteEvento(id, tenantId)
        if (!response.success) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al eliminar el evento' })
          return
        }
        const { eventos } = get()
        set({
          eventos: eventos.filter(e => e.id !== id),
          isSaving: false,
          successMessage: 'Evento eliminado',
        })
      },

      setFilterTipo: (tipo) => set({ filterTipo: tipo }),
      setFilterFechaDesde: (fecha) => set({ filterFechaDesde: fecha }),
      setFilterFechaHasta: (fecha) => set({ filterFechaHasta: fecha }),
      clearFilters: () => set({ filterTipo: '', filterFechaDesde: '', filterFechaHasta: '' }),
      clearError: () => set({ error: null }),
      clearSuccessMessage: () => set({ successMessage: null }),
    }),
    {
      name: 'agrofield-eventos',
      partialize: (state) => ({
        eventos: state.eventos as Evento[],
      }),
    },
  ),
)

export function getFilteredEventos(state: EventosStore): Evento[] {
  const { eventos, filterTipo, filterFechaDesde, filterFechaHasta } = state

  let result = eventos.filter(e => !e.deletedAt)

  if (filterTipo) {
    result = result.filter(e => e.tipo === filterTipo)
  }

  if (filterFechaDesde) {
    result = result.filter(e => e.fecha >= filterFechaDesde)
  }

  if (filterFechaHasta) {
    result = result.filter(e => e.fecha <= filterFechaHasta)
  }

  return [...result].sort((a, b) => b.fecha.localeCompare(a.fecha))
}
