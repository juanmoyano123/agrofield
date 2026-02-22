export type LoteActividad = 'agricultura' | 'ganaderia'

export type TipoProduccionGanadera = 'cria' | 'recria' | 'engorde' | 'tambo'

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
  // F-021: Livestock fields (optional, only relevant when actividad === 'ganaderia')
  cabezas?: number
  raza?: string
  tipoProduccion?: TipoProduccionGanadera
  categoriaAnimal?: string
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
  // F-021: Livestock fields (optional)
  cabezas?: number
  raza?: string
  tipoProduccion?: TipoProduccionGanadera
  categoriaAnimal?: string
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
