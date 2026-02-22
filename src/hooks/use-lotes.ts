import { useShallow } from 'zustand/shallow'
import { useLotesStore, getFilteredAndSortedLotes } from '../stores/lotes-store'

export function useLotes() {
  const lotes = useLotesStore(s => s.lotes)
  const isLoading = useLotesStore(s => s.isLoading)
  const isSaving = useLotesStore(s => s.isSaving)
  const error = useLotesStore(s => s.error)
  const successMessage = useLotesStore(s => s.successMessage)
  const searchQuery = useLotesStore(s => s.searchQuery)
  const filterActividad = useLotesStore(s => s.filterActividad)
  const sortField = useLotesStore(s => s.sortField)
  const sortOrder = useLotesStore(s => s.sortOrder)
  const fetchLotes = useLotesStore(s => s.fetchLotes)
  const createLote = useLotesStore(s => s.createLote)
  const updateLote = useLotesStore(s => s.updateLote)
  const deleteLote = useLotesStore(s => s.deleteLote)
  const setSearchQuery = useLotesStore(s => s.setSearchQuery)
  const setFilterActividad = useLotesStore(s => s.setFilterActividad)
  const setSortField = useLotesStore(s => s.setSortField)
  const setSortOrder = useLotesStore(s => s.setSortOrder)
  const clearError = useLotesStore(s => s.clearError)
  const clearSuccessMessage = useLotesStore(s => s.clearSuccessMessage)

  const filteredLotes = useLotesStore(useShallow(getFilteredAndSortedLotes))

  return {
    lotes,
    filteredLotes,
    isLoading,
    isSaving,
    error,
    successMessage,
    searchQuery,
    filterActividad,
    sortField,
    sortOrder,
    fetchLotes,
    createLote,
    updateLote,
    deleteLote,
    setSearchQuery,
    setFilterActividad,
    setSortField,
    setSortOrder,
    clearError,
    clearSuccessMessage,
  }
}
