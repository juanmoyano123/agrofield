export type LoteActividad = 'agricultura' | 'ganaderia'

export interface Lote {
  id: string
  tenantId: string
  nombre: string
  ubicacion?: string
  hectareas: number
  actividad: LoteActividad
  latitud?: number
  longitud?: number
  costoTotal: number       // placeholder, populated by F-005/F-007
  ultimoEvento?: string    // placeholder, populated by F-003
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLoteData {
  nombre: string
  ubicacion?: string
  hectareas: number
  actividad: LoteActividad
  latitud?: number
  longitud?: number
}

export type UpdateLoteData = Partial<CreateLoteData>

export interface LotesState {
  lotes: Lote[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  searchQuery: string
  filterActividad: LoteActividad | ''
  sortField: 'nombre' | 'hectareas'
  sortOrder: 'asc' | 'desc'
}
