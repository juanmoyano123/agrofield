import { useShallow } from 'zustand/shallow'
import { useTrabajosStore, getFilteredTrabajos, getTotalGastos } from '../stores/contratistas-store'

export function useContratistas() {
  const contratistas = useTrabajosStore(s => s.contratistas)
  const isLoading = useTrabajosStore(s => s.isLoading)
  const isSaving = useTrabajosStore(s => s.isSaving)
  const error = useTrabajosStore(s => s.error)
  const successMessage = useTrabajosStore(s => s.successMessage)
  const filterContratista = useTrabajosStore(s => s.filterContratista)
  const filterLote = useTrabajosStore(s => s.filterLote)
  const filterFechaDesde = useTrabajosStore(s => s.filterFechaDesde)
  const filterFechaHasta = useTrabajosStore(s => s.filterFechaHasta)
  const fetchTrabajos = useTrabajosStore(s => s.fetchTrabajos)
  const fetchContratistas = useTrabajosStore(s => s.fetchContratistas)
  const createTrabajo = useTrabajosStore(s => s.createTrabajo)
  const updateTrabajo = useTrabajosStore(s => s.updateTrabajo)
  const deleteTrabajo = useTrabajosStore(s => s.deleteTrabajo)
  const createContratista = useTrabajosStore(s => s.createContratista)
  const setFilterContratista = useTrabajosStore(s => s.setFilterContratista)
  const setFilterLote = useTrabajosStore(s => s.setFilterLote)
  const setFilterFechaDesde = useTrabajosStore(s => s.setFilterFechaDesde)
  const setFilterFechaHasta = useTrabajosStore(s => s.setFilterFechaHasta)
  const clearError = useTrabajosStore(s => s.clearError)
  const clearSuccessMessage = useTrabajosStore(s => s.clearSuccessMessage)

  // Arrays must use useShallow to avoid unnecessary re-renders
  const filteredTrabajos = useTrabajosStore(useShallow(getFilteredTrabajos))

  // number — no useShallow needed
  const totalGastos = useTrabajosStore(getTotalGastos)

  return {
    contratistas,
    filteredTrabajos,
    totalGastos,
    isLoading,
    isSaving,
    error,
    successMessage,
    filterContratista,
    filterLote,
    filterFechaDesde,
    filterFechaHasta,
    fetchTrabajos,
    fetchContratistas,
    createTrabajo,
    updateTrabajo,
    deleteTrabajo,
    createContratista,
    setFilterContratista,
    setFilterLote,
    setFilterFechaDesde,
    setFilterFechaHasta,
    clearError,
    clearSuccessMessage,
  }
}
