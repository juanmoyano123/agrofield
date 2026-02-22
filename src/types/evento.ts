export type TipoEvento = 'siembra' | 'aplicacion' | 'cosecha' | 'monitoreo' | 'servicio' | 'riego' | 'otro'

export interface EventoInsumo {
  id: string
  productoId: string
  productoName: string
  cantidad: number
  unidad: string
  costoUnitario: number
  subtotal: number
}

export interface Evento {
  id: string
  tenantId: string
  loteId: string
  tipo: TipoEvento
  fecha: string
  insumos: EventoInsumo[]
  costoManual?: number
  costoTotal: number
  responsable?: string
  notas?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventoData {
  tipo: TipoEvento
  fecha: string
  insumos: Omit<EventoInsumo, 'id'>[]
  costoManual?: number
  responsable?: string
  notas?: string
}

export type UpdateEventoData = Partial<CreateEventoData>

export interface EventosState {
  eventos: Evento[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  filterTipo: TipoEvento | ''
  filterFechaDesde: string
  filterFechaHasta: string
}
