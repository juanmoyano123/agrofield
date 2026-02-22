import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, Map, Download } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useLotes } from '../hooks/use-lotes'
import { useEventos } from '../hooks/use-eventos'
import { useImputacionGlobal } from '../hooks/use-imputacion'
import { useTrabajosStore } from '../stores/contratistas-store'
import { LoteCard } from '../components/lotes/lote-card'
import { LoteFormModal } from '../components/lotes/lote-form-modal'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { EmptyState } from '../components/ui/empty-state'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import { toCsvString, downloadCsv, getCsvFilename } from '../lib/csv-export'
import type { Lote, LoteActividad } from '../types'
import type { CreateLoteOutputData } from '../lib/validations/lote-schemas'

export function LotesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
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
  } = useLotes()

  // F-005: Imputacion — fetch all eventos + trabajos and derive costs per lote
  const { fetchAllEventos } = useEventos()
  const costosMap = useImputacionGlobal()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLote, setEditingLote] = useState<Lote | null>(null)
  const [deletingLote, setDeletingLote] = useState<Lote | null>(null)

  // Fetch lotes on mount
  useEffect(() => {
    if (!user) return
    void fetchLotes(user.tenantId)
    // F-005: Also fetch all eventos and trabajos so the imputacion engine
    // can compute cross-lote cost aggregations without per-lote API calls
    void fetchAllEventos(user.tenantId)
    void useTrabajosStore.getState().fetchTrabajos(user.tenantId)
  }, [user, fetchLotes, fetchAllEventos])

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => clearSuccessMessage(), 3000)
    return () => clearTimeout(timer)
  }, [successMessage, clearSuccessMessage])

  function handleOpenCreate() {
    setEditingLote(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(lote: Lote) {
    setEditingLote(lote)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingLote(null)
  }

  function handleOpenDelete(lote: Lote) {
    setDeletingLote(lote)
  }

  function handleCancelDelete() {
    setDeletingLote(null)
  }

  async function handleFormSubmit(data: CreateLoteOutputData) {
    if (!user) return
    if (editingLote) {
      await updateLote(editingLote.id, data, user.tenantId)
    } else {
      await createLote(data, user.tenantId)
    }
    // Close modal only if no error (store clears error on next action)
    setIsFormOpen(false)
    setEditingLote(null)
  }

  async function handleConfirmDelete() {
    if (!deletingLote || !user) return
    await deleteLote(deletingLote.id, user.tenantId)
    setDeletingLote(null)
  }

  function handleExportCsv() {
    const csv = toCsvString(filteredLotes, [
      { header: 'Nombre', accessor: l => l.nombre },
      { header: 'Ubicacion', accessor: l => l.ubicacion ?? '' },
      { header: 'Hectareas', accessor: l => l.hectareas },
      { header: 'Actividad', accessor: l => l.actividad },
      { header: 'Latitud', accessor: l => l.latitud ?? '' },
      { header: 'Longitud', accessor: l => l.longitud ?? '' },
    ])
    downloadCsv(csv, getCsvFilename('lotes'))
  }

  function handleToggleSort(field: 'nombre' | 'hectareas') {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortIcon = (field: 'nombre' | 'hectareas') => {
    if (sortField !== field) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">Lotes</h1>
          <p className="text-sm text-text-muted mt-1">
            Gestión de lotes y superficies del campo
          </p>
        </div>
        {/* Desktop: buttons in header */}
        <div className="hidden sm:flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handleExportCsv} disabled={filteredLotes.length === 0}>
            <Download size={16} />
            Exportar CSV
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/mapa')}>
            <Map size={18} />
            Ver mapa
          </Button>
          <Button type="button" variant="primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            Nuevo lote
          </Button>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <Alert variant="error">
          {error}
          <button
            type="button"
            onClick={clearError}
            className="ml-2 underline text-xs"
            aria-label="Cerrar error"
          >
            Cerrar
          </button>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Search + Filters bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o ubicación..."
                aria-label="Buscar lotes"
                className="
                  w-full pl-9 pr-4 py-3 border border-border-warm-strong rounded-sm bg-surface
                  text-base text-text-primary placeholder-text-muted
                  hover:border-copper-light
                  focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
                  min-h-[44px]
                  transition-colors duration-300
                "
              />
            </div>

            {/* Filter by actividad */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
              <select
                value={filterActividad}
                onChange={e => setFilterActividad(e.target.value as LoteActividad | '')}
                aria-label="Filtrar por actividad"
                className="
                  px-3 py-3 border border-border-warm-strong rounded-sm bg-surface
                  text-base text-text-primary
                  hover:border-copper-light
                  focus:outline-none focus:ring-2 focus:ring-field-green focus:border-transparent
                  min-h-[44px]
                  transition-colors duration-300
                "
              >
                <option value="">Todas las actividades</option>
                <option value="agricultura">Agricultura</option>
                <option value="ganaderia">Ganadería</option>
              </select>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Ordenar por:</span>
            <button
              type="button"
              onClick={() => handleToggleSort('nombre')}
              className={`
                px-3 py-1 rounded-sm transition-colors duration-300 min-h-[36px]
                ${sortField === 'nombre'
                  ? 'bg-field-green text-white'
                  : 'bg-surface hover:bg-parchment text-text-dim border border-border-warm'
                }
              `}
            >
              Nombre{sortIcon('nombre')}
            </button>
            <button
              type="button"
              onClick={() => handleToggleSort('hectareas')}
              className={`
                px-3 py-1 rounded-sm transition-colors duration-300 min-h-[36px]
                ${sortField === 'hectareas'
                  ? 'bg-field-green text-white'
                  : 'bg-surface hover:bg-parchment text-text-dim border border-border-warm'
                }
              `}
            >
              Superficie{sortIcon('hectareas')}
            </button>
          </div>

          {/* Lotes grid or empty state */}
          {filteredLotes.length === 0 ? (
            <EmptyState
              icon="🌾"
              title="No hay lotes"
              description={
                searchQuery || filterActividad
                  ? 'No se encontraron lotes con los filtros actuales.'
                  : 'Creá tu primer lote para empezar a registrar operaciones de campo.'
              }
              action={
                !searchQuery && !filterActividad
                  ? { label: 'Crear primer lote', onClick: handleOpenCreate }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLotes.map(lote => (
                <LoteCard
                  key={lote.id}
                  lote={lote}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onClick={() => navigate(`/lotes/${lote.id}/eventos`)}
                  costoLote={costosMap.get(lote.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        aria-label="Crear nuevo lote"
        onClick={handleOpenCreate}
        className="
          sm:hidden
          fixed bottom-24 right-4 z-40
          w-14 h-14 rounded-full
          bg-field-green text-white shadow-warm
          flex items-center justify-center
          hover:bg-field-green-dark active:bg-field-green-darker
          transition-colors duration-300
        "
      >
        <Plus size={24} />
      </button>

      {/* Create/Edit Modal */}
      <LoteFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        lote={editingLote}
        isSaving={isSaving}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLote)}
        title="Eliminar lote"
        message={
          deletingLote
            ? `¿Estás seguro que querés eliminar "${deletingLote.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isSaving}
      />
    </div>
  )
}
