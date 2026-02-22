export type TipoEventoRodeo =
  | 'pesaje'
  | 'vacunacion'
  | 'desparasitacion'
  | 'curacion'
  | 'servicio_toro'
  | 'inseminacion'
  | 'tacto'
  | 'paricion'
  | 'destete'
  | 'ingreso'
  | 'egreso'
  | 'muerte'

export type CategoriaRodeo = 'pesaje' | 'sanidad' | 'reproduccion' | 'movimiento'

export type ResultadoTacto = 'prenada' | 'vacia' | 'dudosa'

export const CATEGORIA_POR_TIPO: Record<TipoEventoRodeo, CategoriaRodeo> = {
  pesaje: 'pesaje',
  vacunacion: 'sanidad',
  desparasitacion: 'sanidad',
  curacion: 'sanidad',
  servicio_toro: 'reproduccion',
  inseminacion: 'reproduccion',
  tacto: 'reproduccion',
  paricion: 'reproduccion',
  destete: 'reproduccion',
  ingreso: 'movimiento',
  egreso: 'movimiento',
  muerte: 'movimiento',
}

export interface EventoRodeo {
  id: string
  tenantId: string
  loteId: string
  tipo: TipoEventoRodeo
  categoria: CategoriaRodeo
  fecha: string
  cantidadCabezas: number
  // Pesaje
  pesoPromedio?: number
  pesoTotal?: number
  ganaDiaria?: number
  // Sanidad
  productoSanitario?: string
  dosisMl?: number
  loteSanitario?: string
  veterinario?: string
  proximaDosis?: string
  // Reproduccion
  toroId?: string
  resultadoTacto?: ResultadoTacto
  cantidadPreniadas?: number
  cantidadVacias?: number
  pesoDestete?: number
  // Movimiento
  motivo?: string
  origenDestino?: string
  precioUnitario?: number
  // Comunes
  costoManual?: number
  costoTotal: number
  responsable?: string
  notas?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventoRodeoData {
  tipo: TipoEventoRodeo
  fecha: string
  cantidadCabezas: number
  pesoPromedio?: number
  productoSanitario?: string
  dosisMl?: number
  loteSanitario?: string
  veterinario?: string
  proximaDosis?: string
  toroId?: string
  resultadoTacto?: ResultadoTacto
  cantidadPreniadas?: number
  cantidadVacias?: number
  pesoDestete?: number
  motivo?: string
  origenDestino?: string
  precioUnitario?: number
  costoManual?: number
  responsable?: string
  notas?: string
}

export type UpdateEventoRodeoData = Partial<CreateEventoRodeoData>

export interface EventosRodeoState {
  eventos: EventoRodeo[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  filterCategoria: CategoriaRodeo | ''
  filterFechaDesde: string
  filterFechaHasta: string
}
