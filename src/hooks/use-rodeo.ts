import { useShallow } from 'zustand/shallow'
import { useRodeoStore, getFilteredEventosRodeo } from '../stores/rodeo-store'

export function useRodeo() {
  const eventos = useRodeoStore(s => s.eventos)
  const isLoading = useRodeoStore(s => s.isLoading)
  const isSaving = useRodeoStore(s => s.isSaving)
  const error = useRodeoStore(s => s.error)
  const successMessage = useRodeoStore(s => s.successMessage)
  const filterCategoria = useRodeoStore(s => s.filterCategoria)
  const filterFechaDesde = useRodeoStore(s => s.filterFechaDesde)
  const filterFechaHasta = useRodeoStore(s => s.filterFechaHasta)
  const fetchEventosRodeo = useRodeoStore(s => s.fetchEventosRodeo)
  const fetchAllEventosRodeo = useRodeoStore(s => s.fetchAllEventosRodeo)
  const createEventoRodeo = useRodeoStore(s => s.createEventoRodeo)
  const updateEventoRodeo = useRodeoStore(s => s.updateEventoRodeo)
  const deleteEventoRodeo = useRodeoStore(s => s.deleteEventoRodeo)
  const setFilterCategoria = useRodeoStore(s => s.setFilterCategoria)
  const setFilterFechaDesde = useRodeoStore(s => s.setFilterFechaDesde)
  const setFilterFechaHasta = useRodeoStore(s => s.setFilterFechaHasta)
  const clearFilters = useRodeoStore(s => s.clearFilters)
  const clearError = useRodeoStore(s => s.clearError)
  const clearSuccessMessage = useRodeoStore(s => s.clearSuccessMessage)

  const filteredEventosRodeo = useRodeoStore(useShallow(getFilteredEventosRodeo))

  return {
    eventos,
    filteredEventosRodeo,
    isLoading,
    isSaving,
    error,
    successMessage,
    filterCategoria,
    filterFechaDesde,
    filterFechaHasta,
    fetchEventosRodeo,
    fetchAllEventosRodeo,
    createEventoRodeo,
    updateEventoRodeo,
    deleteEventoRodeo,
    setFilterCategoria,
    setFilterFechaDesde,
    setFilterFechaHasta,
    clearFilters,
    clearError,
    clearSuccessMessage,
  }
}
