import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useEventos } from '../hooks/use-eventos'
import { useLotes } from '../hooks/use-lotes'
import { productosApi } from '../lib/api-client'
import { EventoTimeline } from '../components/eventos/evento-timeline'
import { EventosFilters } from '../components/eventos/eventos-filters'
import { EventoFormModal } from '../components/eventos/evento-form-modal'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import type { Evento, Producto, TipoEvento } from '../types'
import type { EventoFormSchema } from '../lib/validations/evento-schemas'

export function EventosPage() {
  const { id: loteId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
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
  } = useEventos()
  const { lotes, fetchLotes } = useLotes()

  const [productos, setProductos] = useState<Producto[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [deletingEvento, setDeletingEvento] = useState<Evento | null>(null)

  const lote = lotes.find(l => l.id === loteId)

  // Fetch on mount
  useEffect(() => {
    if (!user || !loteId) return
    void fetchEventos(loteId, user.tenantId)
    void fetchLotes(user.tenantId)
    void productosApi.getProductos(user.tenantId).then(res => {
      if (res.success && res.data) setProductos(res.data)
    })
  }, [user, loteId, fetchEventos, fetchLotes])

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => clearSuccessMessage(), 3000)
    return () => clearTimeout(timer)
  }, [successMessage, clearSuccessMessage])

  function handleOpenCreate() {
    setEditingEvento(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(evento: Evento) {
    setEditingEvento(evento)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingEvento(null)
  }

  function handleOpenDelete(evento: Evento) {
    setDeletingEvento(evento)
  }

  function handleCancelDelete() {
    setDeletingEvento(null)
  }

  async function handleConfirmDelete() {
    if (!deletingEvento || !user) return
    await deleteEvento(deletingEvento.id, user.tenantId)
    setDeletingEvento(null)
  }

  function handleFormSubmit(data: EventoFormSchema) {
    if (!user || !loteId) return
    const createData = {
      tipo: data.tipo,
      fecha: data.fecha,
      insumos: data.insumos,
      costoManual: data.costoManual,
      responsable: data.responsable,
      notas: data.notas,
    }
    if (editingEvento) {
      void updateEvento(editingEvento.id, createData, user.tenantId)
    } else {
      void createEvento(createData, loteId, user.tenantId)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/lotes')}
            aria-label="Volver a lotes"
            className="
              mt-0.5 w-9 h-9 flex items-center justify-center
              rounded-sm border border-border-warm text-text-muted
              hover:bg-parchment hover:text-text-dim
              transition-colors duration-300 shrink-0
            "
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-0.5">
              Timeline
            </p>
            <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
              {lote?.nombre ?? 'Lote'}
            </h1>
            {lote?.ubicacion && (
              <p className="text-sm text-text-muted mt-0.5">{lote.ubicacion}</p>
            )}
          </div>
        </div>
        {/* Desktop button */}
        <div className="hidden sm:block shrink-0">
          <Button type="button" variant="primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            Registrar evento
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <Alert variant="error">
          {error}
          <button type="button" onClick={clearError} className="ml-2 underline text-xs" aria-label="Cerrar error">
            Cerrar
          </button>
        </Alert>
      )}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Filters */}
          <EventosFilters
            filterTipo={filterTipo as TipoEvento | ''}
            filterFechaDesde={filterFechaDesde}
            filterFechaHasta={filterFechaHasta}
            onTipoChange={setFilterTipo}
            onFechaDesdeChange={setFilterFechaDesde}
            onFechaHastaChange={setFilterFechaHasta}
            onClear={clearFilters}
          />

          {/* Timeline */}
          <EventoTimeline
            eventos={filteredEventos}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onAddClick={handleOpenCreate}
          />
        </>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        aria-label="Registrar nuevo evento"
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

      {/* Form Modal */}
      <EventoFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        evento={editingEvento}
        isSaving={isSaving}
        error={error}
        onClearError={clearError}
        productos={productos}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingEvento)}
        title="Eliminar evento"
        message={
          deletingEvento
            ? `¿Estás seguro que querés eliminar este evento de ${deletingEvento.tipo} del ${deletingEvento.fecha}?`
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
