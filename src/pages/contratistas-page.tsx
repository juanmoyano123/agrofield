import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useContratistas } from '../hooks/use-contratistas'
import { useLotes } from '../hooks/use-lotes'
import { TrabajoCard } from '../components/contratistas/trabajo-card'
import { TrabajosFilterBar } from '../components/contratistas/trabajos-filter-bar'
import { TrabajoFormModal } from '../components/contratistas/trabajo-form-modal'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { EmptyState } from '../components/ui/empty-state'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import type { TrabajoContratista } from '../types'
import type { CreateTrabajoFormData } from '../lib/validations/contratista-schemas'

export function ContratistasPage() {
  const { user } = useAuth()
  const {
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
  } = useContratistas()

  const { lotes, fetchLotes } = useLotes()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTrabajo, setEditingTrabajo] = useState<TrabajoContratista | null>(null)
  const [deletingTrabajo, setDeletingTrabajo] = useState<TrabajoContratista | null>(null)

  // Fetch data on mount
  useEffect(() => {
    if (!user) return
    void fetchTrabajos(user.tenantId)
    void fetchContratistas(user.tenantId)
    void fetchLotes(user.tenantId)
  }, [user, fetchTrabajos, fetchContratistas, fetchLotes])

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => clearSuccessMessage(), 3000)
    return () => clearTimeout(timer)
  }, [successMessage, clearSuccessMessage])

  function handleOpenCreate() {
    setEditingTrabajo(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(trabajo: TrabajoContratista) {
    setEditingTrabajo(trabajo)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingTrabajo(null)
  }

  function handleOpenDelete(trabajo: TrabajoContratista) {
    setDeletingTrabajo(trabajo)
  }

  function handleCancelDelete() {
    setDeletingTrabajo(null)
  }

  async function handleFormSubmit(data: CreateTrabajoFormData) {
    if (!user) return
    // Build the full CreateTrabajoData including loteNombre from lotes list
    const loteSeleccionado = lotes.find(l => l.id === data.loteId)
    const payload = {
      ...data,
      loteNombre: loteSeleccionado?.nombre ?? data.loteNombre ?? undefined,
      loteId: data.loteId || undefined,
    }
    if (editingTrabajo) {
      await updateTrabajo(editingTrabajo.id, payload, user.tenantId)
    } else {
      await createTrabajo(payload, user.tenantId)
    }
    setIsFormOpen(false)
    setEditingTrabajo(null)
  }

  async function handleConfirmDelete() {
    if (!deletingTrabajo || !user) return
    await deleteTrabajo(deletingTrabajo.id, user.tenantId)
    setDeletingTrabajo(null)
  }

  const hasFilters = Boolean(filterContratista || filterLote || filterFechaDesde || filterFechaHasta)

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
            Operaciones
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Registro de trabajos de contratistas y gastos de campo
          </p>
        </div>
        {/* Desktop: button in header */}
        <div className="hidden sm:block">
          <Button type="button" variant="primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            Registrar trabajo
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
          {/* Filter bar */}
          <TrabajosFilterBar
            contratistas={contratistas}
            lotes={lotes.filter(l => !l.deletedAt)}
            filterContratista={filterContratista}
            filterLote={filterLote}
            filterFechaDesde={filterFechaDesde}
            filterFechaHasta={filterFechaHasta}
            totalGastos={totalGastos}
            onFilterContratista={setFilterContratista}
            onFilterLote={setFilterLote}
            onFilterFechaDesde={setFilterFechaDesde}
            onFilterFechaHasta={setFilterFechaHasta}
          />

          {/* Trabajos grid or empty state */}
          {filteredTrabajos.length === 0 ? (
            <EmptyState
              icon="🚜"
              title="No hay trabajos registrados"
              description={
                hasFilters
                  ? 'No se encontraron trabajos con los filtros actuales.'
                  : 'Registrá el primer trabajo de contratista para empezar a controlar los gastos operativos.'
              }
              action={
                !hasFilters
                  ? { label: 'Registrar trabajo', onClick: handleOpenCreate }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrabajos.map(trabajo => (
                <TrabajoCard
                  key={trabajo.id}
                  trabajo={trabajo}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        aria-label="Registrar nuevo trabajo"
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
      <TrabajoFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        trabajo={editingTrabajo}
        isSaving={isSaving}
        contratistas={contratistas}
        lotes={lotes.filter(l => !l.deletedAt)}
        onCreateContratista={async (nombre) => {
          if (!user) return null
          return createContratista(nombre, user.tenantId)
        }}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTrabajo)}
        title="Eliminar trabajo"
        message={
          deletingTrabajo
            ? `¿Estás seguro que querés eliminar este trabajo de "${deletingTrabajo.contratistaNombre}"? Esta acción no se puede deshacer.`
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
