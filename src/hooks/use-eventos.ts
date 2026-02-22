import { useEventosStore, getFilteredEventos } from '../stores/eventos-store'

export function useEventos() {
  const eventos = useEventosStore(s => s.eventos)
  const isLoading = useEventosStore(s => s.isLoading)
  const isSaving = useEventosStore(s => s.isSaving)
  const error = useEventosStore(s => s.error)
  const successMessage = useEventosStore(s => s.successMessage)
  const filterTipo = useEventosStore(s => s.filterTipo)
  const filterFechaDesde = useEventosStore(s => s.filterFechaDesde)
  const filterFechaHasta = useEventosStore(s => s.filterFechaHasta)
  const fetchEventos = useEventosStore(s => s.fetchEventos)
  const createEvento = useEventosStore(s => s.createEvento)
  const updateEvento = useEventosStore(s => s.updateEvento)
  const deleteEvento = useEventosStore(s => s.deleteEvento)
  const setFilterTipo = useEventosStore(s => s.setFilterTipo)
  const setFilterFechaDesde = useEventosStore(s => s.setFilterFechaDesde)
  const setFilterFechaHasta = useEventosStore(s => s.setFilterFechaHasta)
  const clearFilters = useEventosStore(s => s.clearFilters)
  const clearError = useEventosStore(s => s.clearError)
  const clearSuccessMessage = useEventosStore(s => s.clearSuccessMessage)

  const filteredEventos = useEventosStore(getFilteredEventos)

  return {
    eventos,
    filteredEventos,
    isLoading,
    isSaving,
    error,
    successMessage,
    filterTipo,
    filterFechaDesde,
    filterFechaHasta,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    setFilterTipo,
    setFilterFechaDesde,
    setFilterFechaHasta,
    clearFilters,
    clearError,
    clearSuccessMessage,
  }
}
