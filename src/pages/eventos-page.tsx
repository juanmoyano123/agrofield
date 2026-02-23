import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useEventos } from '../hooks/use-eventos'
import { useRodeo } from '../hooks/use-rodeo'
import { useLotes } from '../hooks/use-lotes'
import { useImputacionLote } from '../hooks/use-imputacion'
import { productosApi } from '../lib/api-client'
import { EventoTimeline } from '../components/eventos/evento-timeline'
import { EventosFilters } from '../components/eventos/eventos-filters'
import { EventoFormModal } from '../components/eventos/evento-form-modal'
import { RodeoTimeline } from '../components/rodeo/rodeo-timeline'
import { RodeoFilters } from '../components/rodeo/rodeo-filters'
import { RodeoFormModal } from '../components/rodeo/rodeo-form-modal'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Alert } from '../components/ui/alert'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import { CostoResumenBar } from '../components/costos/costo-resumen-bar'
import { CostoDesglose } from '../components/costos/costo-desglose'
import { useCostoKiloLote } from '../hooks/use-costo-kilo'
import type { Evento, Producto, TipoEvento, EventoRodeo } from '../types'
import type { EventoFormSchema } from '../lib/validations/evento-schemas'
import type { CreateEventoRodeoSchema } from '../lib/validations/rodeo-schemas'

type ActiveTab = 'eventos' | 'rodeo'

export function EventosPage() {
  const { id: loteId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Eventos (agricultura) state and actions
  const {
    filteredEventos,
    isLoading: eventosLoading,
    isSaving: eventosSaving,
    error: eventosError,
    successMessage: eventosSuccess,
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
    clearFilters: clearEventosFilters,
    clearError: clearEventosError,
    clearSuccessMessage: clearEventosSuccess,
  } = useEventos()

  // Rodeo (ganaderia) state and actions
  const {
    filteredEventosRodeo,
    isLoading: rodeoLoading,
    isSaving: rodeoSaving,
    error: rodeoError,
    successMessage: rodeoSuccess,
    filterCategoria,
    filterFechaDesde: rodeoFechaDesde,
    filterFechaHasta: rodeoFechaHasta,
    fetchEventosRodeo,
    createEventoRodeo,
    updateEventoRodeo,
    deleteEventoRodeo,
    setFilterCategoria,
    setFilterFechaDesde: setRodeoFechaDesde,
    setFilterFechaHasta: setRodeoFechaHasta,
    clearFilters: clearRodeoFilters,
    clearError: clearRodeoError,
    clearSuccessMessage: clearRodeoSuccess,
  } = useRodeo()

  const { lotes, fetchLotes } = useLotes()

  const [productos, setProductos] = useState<Producto[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('eventos')

  // Eventos form/delete state
  const [isEventoFormOpen, setIsEventoFormOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [deletingEvento, setDeletingEvento] = useState<Evento | null>(null)

  // Rodeo form/delete state
  const [isRodeoFormOpen, setIsRodeoFormOpen] = useState(false)
  const [editingEventoRodeo, setEditingEventoRodeo] = useState<EventoRodeo | null>(null)
  const [deletingEventoRodeo, setDeletingEventoRodeo] = useState<EventoRodeo | null>(null)

  const lote = lotes.find(l => l.id === loteId)
  const isGanaderia = lote?.actividad === 'ganaderia'

  // F-016: Derived cost data for this lote — includes eventos + contratistas
  const { costo, lineas } = useImputacionLote(loteId ?? '', lote?.hectareas ?? 0)
  const [isCostoExpanded, setIsCostoExpanded] = useState(false)

  // F-026: Costo por kilo for this lote (only meaningful for ganaderia)
  const { costoKilo } = useCostoKiloLote(
    loteId ?? '',
    lote?.nombre ?? '',
    lote?.cabezas ?? 0,
  )

  // Fetch on mount: always fetch eventos; fetch rodeo only for ganaderia lotes
  useEffect(() => {
    if (!user || !loteId) return
    void fetchEventos(loteId, user.tenantId)
    void fetchLotes(user.tenantId)
    void productosApi.getProductos(user.tenantId).then(res => {
      if (res.success && res.data) setProductos(res.data)
    })
  }, [user, loteId, fetchEventos, fetchLotes])

  // Fetch rodeo data when tab switches to 'rodeo' or when lote turns out to be ganaderia
  useEffect(() => {
    if (!user || !loteId || !isGanaderia) return
    void fetchEventosRodeo(loteId, user.tenantId)
  }, [user, loteId, isGanaderia, fetchEventosRodeo])

  // For ganaderia lotes, default to rodeo tab on first load
  useEffect(() => {
    if (isGanaderia) {
      setActiveTab('rodeo')
    }
  }, [isGanaderia])

  // Auto-dismiss success messages
  useEffect(() => {
    if (!eventosSuccess) return
    const timer = setTimeout(() => clearEventosSuccess(), 3000)
    return () => clearTimeout(timer)
  }, [eventosSuccess, clearEventosSuccess])

  useEffect(() => {
    if (!rodeoSuccess) return
    const timer = setTimeout(() => clearRodeoSuccess(), 3000)
    return () => clearTimeout(timer)
  }, [rodeoSuccess, clearRodeoSuccess])

  // --- Eventos handlers ---
  function handleOpenCreateEvento() {
    setEditingEvento(null)
    setIsEventoFormOpen(true)
  }

  function handleOpenEditEvento(evento: Evento) {
    setEditingEvento(evento)
    setIsEventoFormOpen(true)
  }

  function handleCloseEventoForm() {
    setIsEventoFormOpen(false)
    setEditingEvento(null)
  }

  function handleOpenDeleteEvento(evento: Evento) {
    setDeletingEvento(evento)
  }

  function handleCancelDeleteEvento() {
    setDeletingEvento(null)
  }

  async function handleConfirmDeleteEvento() {
    if (!deletingEvento || !user) return
    await deleteEvento(deletingEvento.id, user.tenantId)
    setDeletingEvento(null)
  }

  function handleEventoFormSubmit(data: EventoFormSchema) {
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

  // --- Rodeo handlers ---
  function handleOpenCreateRodeo() {
    setEditingEventoRodeo(null)
    setIsRodeoFormOpen(true)
  }

  function handleOpenEditRodeo(evento: EventoRodeo) {
    setEditingEventoRodeo(evento)
    setIsRodeoFormOpen(true)
  }

  function handleCloseRodeoForm() {
    setIsRodeoFormOpen(false)
    setEditingEventoRodeo(null)
  }

  function handleOpenDeleteRodeo(evento: EventoRodeo) {
    setDeletingEventoRodeo(evento)
  }

  function handleCancelDeleteRodeo() {
    setDeletingEventoRodeo(null)
  }

  async function handleConfirmDeleteRodeo() {
    if (!deletingEventoRodeo || !user) return
    await deleteEventoRodeo(deletingEventoRodeo.id, user.tenantId)
    setDeletingEventoRodeo(null)
  }

  function handleRodeoFormSubmit(data: CreateEventoRodeoSchema) {
    if (!user || !loteId) return
    if (editingEventoRodeo) {
      void updateEventoRodeo(editingEventoRodeo.id, data, user.tenantId)
    } else {
      void createEventoRodeo(data, loteId, user.tenantId)
    }
  }

  // Determine current tab loading/saving state for FAB and button
  const isCurrentTabLoading = activeTab === 'rodeo' ? rodeoLoading : eventosLoading
  const handleAddClick = activeTab === 'rodeo' ? handleOpenCreateRodeo : handleOpenCreateEvento

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

        {/* Desktop: add button */}
        <div className="hidden sm:block shrink-0">
          <Button type="button" variant="primary" onClick={handleAddClick}>
            <Plus size={18} />
            {activeTab === 'rodeo' ? 'Registrar evento de rodeo' : 'Registrar evento'}
          </Button>
        </div>
      </div>

      {/* Tab selector — only visible for ganaderia lotes */}
      {isGanaderia && (
        <div className="flex gap-1 p-1 bg-parchment border border-border-warm rounded-sm w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('eventos')}
            className={`
              px-4 py-2 rounded-sm text-sm font-semibold transition-colors duration-200
              ${activeTab === 'eventos'
                ? 'bg-surface text-text-primary shadow-warm-sm border border-border-warm'
                : 'text-text-muted hover:text-text-dim'
              }
            `}
          >
            Eventos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rodeo')}
            className={`
              px-4 py-2 rounded-sm text-sm font-semibold transition-colors duration-200
              flex items-center gap-1.5
              ${activeTab === 'rodeo'
                ? 'bg-[#4A7C59] text-white shadow-warm-sm'
                : 'text-text-muted hover:text-text-dim'
              }
            `}
          >
            Rodeo
            {/* F-026: $/kg badge — shown when there is enough data to compute */}
            {isGanaderia && costoKilo.costoPorKg > 0 && (
              <span
                title={`Costo por kg: $${costoKilo.costoPorKg.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
                className={`
                  text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${activeTab === 'rodeo'
                    ? 'bg-white/20 text-white'
                    : 'bg-field-green/10 text-field-green'
                  }
                `}
              >
                ${Math.round(costoKilo.costoPorKg).toLocaleString('es-AR')}/kg
              </span>
            )}
          </button>
        </div>
      )}

      {/* Feedback for active tab */}
      {activeTab === 'eventos' && eventosError && (
        <Alert variant="error">
          {eventosError}
          <button type="button" onClick={clearEventosError} className="ml-2 underline text-xs" aria-label="Cerrar error">
            Cerrar
          </button>
        </Alert>
      )}
      {activeTab === 'eventos' && eventosSuccess && (
        <Alert variant="success">{eventosSuccess}</Alert>
      )}

      {activeTab === 'rodeo' && rodeoError && (
        <Alert variant="error">
          {rodeoError}
          <button type="button" onClick={clearRodeoError} className="ml-2 underline text-xs" aria-label="Cerrar error">
            Cerrar
          </button>
        </Alert>
      )}
      {activeTab === 'rodeo' && rodeoSuccess && (
        <Alert variant="success">{rodeoSuccess}</Alert>
      )}

      {/* Loading state */}
      {isCurrentTabLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* ---- EVENTOS TAB ---- */}
      {activeTab === 'eventos' && !eventosLoading && (
        <>
          <EventosFilters
            filterTipo={filterTipo as TipoEvento | ''}
            filterFechaDesde={filterFechaDesde}
            filterFechaHasta={filterFechaHasta}
            onTipoChange={setFilterTipo}
            onFechaDesdeChange={setFilterFechaDesde}
            onFechaHastaChange={setFilterFechaHasta}
            onClear={clearEventosFilters}
          />

          {/* F-016: Cost summary bar — visible only when there are actual costs */}
          {costo.costoTotal > 0 && (
            <div className="flex flex-col gap-2">
              <CostoResumenBar
                costo={costo}
                isExpanded={isCostoExpanded}
                onToggle={() => setIsCostoExpanded(prev => !prev)}
              />
              {isCostoExpanded && (
                <CostoDesglose lineas={lineas} variant="full" />
              )}
            </div>
          )}

          <EventoTimeline
            eventos={filteredEventos}
            onEdit={handleOpenEditEvento}
            onDelete={handleOpenDeleteEvento}
            onAddClick={handleOpenCreateEvento}
          />
        </>
      )}

      {/* ---- RODEO TAB ---- */}
      {activeTab === 'rodeo' && !rodeoLoading && (
        <>
          <RodeoFilters
            filterCategoria={filterCategoria}
            filterFechaDesde={rodeoFechaDesde}
            filterFechaHasta={rodeoFechaHasta}
            onCategoriaChange={setFilterCategoria}
            onFechaDesdeChange={setRodeoFechaDesde}
            onFechaHastaChange={setRodeoFechaHasta}
            onClear={clearRodeoFilters}
          />

          <RodeoTimeline
            eventos={filteredEventosRodeo}
            onEdit={handleOpenEditRodeo}
            onDelete={handleOpenDeleteRodeo}
            onAddClick={handleOpenCreateRodeo}
          />
        </>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        aria-label={activeTab === 'rodeo' ? 'Registrar nuevo evento de rodeo' : 'Registrar nuevo evento'}
        onClick={handleAddClick}
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

      {/* ---- EVENTOS MODALS ---- */}
      <EventoFormModal
        isOpen={isEventoFormOpen}
        onClose={handleCloseEventoForm}
        onSubmit={handleEventoFormSubmit}
        evento={editingEvento}
        isSaving={eventosSaving}
        error={eventosError}
        onClearError={clearEventosError}
        productos={productos}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEvento)}
        title="Eliminar evento"
        message={
          deletingEvento
            ? `Estas seguro que queres eliminar este evento de ${deletingEvento.tipo} del ${deletingEvento.fecha}?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteEvento}
        onCancel={handleCancelDeleteEvento}
        isLoading={eventosSaving}
      />

      {/* ---- RODEO MODALS ---- */}
      <RodeoFormModal
        isOpen={isRodeoFormOpen}
        onClose={handleCloseRodeoForm}
        onSubmit={handleRodeoFormSubmit}
        evento={editingEventoRodeo}
        isSaving={rodeoSaving}
        error={rodeoError}
        onClearError={clearRodeoError}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEventoRodeo)}
        title="Eliminar evento de rodeo"
        message={
          deletingEventoRodeo
            ? `Estas seguro que queres eliminar este evento de ${deletingEventoRodeo.tipo} del ${deletingEventoRodeo.fecha}?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteRodeo}
        onCancel={handleCancelDeleteRodeo}
        isLoading={rodeoSaving}
      />
    </div>
  )
}
