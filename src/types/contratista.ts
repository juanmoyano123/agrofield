export type TipoTrabajo = 'arado' | 'siembra' | 'cosecha' | 'pulverizacion' | 'otro'
export type EstadoTrabajo = 'programado' | 'completado'

export interface Contratista {
  id: string
  tenantId: string
  nombre: string
  telefono?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TrabajoContratista {
  id: string
  tenantId: string
  tipo: TipoTrabajo
  contratistaId: string
  contratistaNombre: string
  loteId?: string
  loteNombre?: string
  costo: number
  fecha: string
  notas?: string
  estado: EstadoTrabajo
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTrabajoData {
  tipo: TipoTrabajo
  contratistaId: string
  contratistaNombre: string
  loteId?: string
  loteNombre?: string
  costo: number
  fecha: string
  notas?: string
  estado: EstadoTrabajo
}

export type UpdateTrabajoData = Partial<CreateTrabajoData>

export interface TrabajosState {
  trabajos: TrabajoContratista[]
  contratistas: Contratista[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  filterContratista: string
  filterLote: string
  filterFechaDesde: string
  filterFechaHasta: string
}
