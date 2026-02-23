export interface Campana {
  id: string
  nombre: string        // ej: "Campaña 2024/25"
  fechaInicio: string   // YYYY-MM-DD
  fechaFin: string      // YYYY-MM-DD
  createdAt: string
}

export interface CampanasState {
  campanas: Campana[]
}
