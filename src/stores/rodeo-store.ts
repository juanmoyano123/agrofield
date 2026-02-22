import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  EventoRodeo,
  EventosRodeoState,
  CreateEventoRodeoData,
  UpdateEventoRodeoData,
  CategoriaRodeo,
} from '../types'
import { rodeoApi } from '../lib/api-client'

interface RodeoActions {
  fetchEventosRodeo: (loteId: string, tenantId: string) => Promise<void>
  createEventoRodeo: (data: CreateEventoRodeoData, loteId: string, tenantId: string) => Promise<void>
  updateEventoRodeo: (id: string, data: UpdateEventoRodeoData, tenantId: string) => Promise<void>
  deleteEventoRodeo: (id: string, tenantId: string) => Promise<void>
  setFilterCategoria: (categoria: CategoriaRodeo | '') => void
  setFilterFechaDesde: (fecha: string) => void
  setFilterFechaHasta: (fecha: string) => void
  clearFilters: () => void
  clearError: () => void
  clearSuccessMessage: () => void
}

type RodeoStore = EventosRodeoState & RodeoActions

const initialState: EventosRodeoState = {
  eventos: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  filterCategoria: '',
  filterFechaDesde: '',
  filterFechaHasta: '',
}

export const useRodeoStore = create<RodeoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchEventosRodeo: async (loteId, tenantId) => {
        set({ isLoading: true, error: null })
        const response = await rodeoApi.getEventosRodeoByLote(loteId, tenantId)
        if (!response.success || !response.data) {
          set({ isLoading: false, error: response.error?.message ?? 'Error al cargar los eventos de rodeo' })
          return
        }
        set({ eventos: response.data, isLoading: false })
      },

      createEventoRodeo: async (data, loteId, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await rodeoApi.createEventoRodeo(data, loteId, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al registrar el evento de rodeo' })
          return
        }
        const { eventos } = get()
        set({
          eventos: [response.data, ...eventos],
          isSaving: false,
          successMessage: 'Evento de rodeo registrado exitosamente',
        })
      },

      updateEventoRodeo: async (id, data, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await rodeoApi.updateEventoRodeo(id, data, tenantId)
        if (!response.success || !response.data) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al actualizar el evento de rodeo' })
          return
        }
        const { eventos } = get()
        const updated = response.data
        set({
          eventos: eventos.map(e => (e.id === id ? updated : e)),
          isSaving: false,
          successMessage: 'Evento de rodeo actualizado exitosamente',
        })
      },

      deleteEventoRodeo: async (id, tenantId) => {
        set({ isSaving: true, error: null, successMessage: null })
        const response = await rodeoApi.deleteEventoRodeo(id, tenantId)
        if (!response.success) {
          set({ isSaving: false, error: response.error?.message ?? 'Error al eliminar el evento de rodeo' })
          return
        }
        const { eventos } = get()
        set({
          eventos: eventos.filter(e => e.id !== id),
          isSaving: false,
          successMessage: 'Evento de rodeo eliminado',
        })
      },

      setFilterCategoria: (categoria) => set({ filterCategoria: categoria }),
      setFilterFechaDesde: (fecha) => set({ filterFechaDesde: fecha }),
      setFilterFechaHasta: (fecha) => set({ filterFechaHasta: fecha }),
      clearFilters: () => set({ filterCategoria: '', filterFechaDesde: '', filterFechaHasta: '' }),
      clearError: () => set({ error: null }),
      clearSuccessMessage: () => set({ successMessage: null }),
    }),
    {
      name: 'agrofield-rodeo',
      partialize: (state) => ({
        eventos: state.eventos as EventoRodeo[],
      }),
    },
  ),
)

export function getFilteredEventosRodeo(state: RodeoStore): EventoRodeo[] {
  const { eventos, filterCategoria, filterFechaDesde, filterFechaHasta } = state

  let result = eventos.filter(e => !e.deletedAt)

  if (filterCategoria) {
    result = result.filter(e => e.categoria === filterCategoria)
  }

  if (filterFechaDesde) {
    result = result.filter(e => e.fecha >= filterFechaDesde)
  }

  if (filterFechaHasta) {
    result = result.filter(e => e.fecha <= filterFechaHasta)
  }

  return [...result].sort((a, b) => b.fecha.localeCompare(a.fecha))
}
