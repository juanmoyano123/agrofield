/**
 * F-026: Motor de Costo por Kilo Ganadero
 *
 * Formula:
 *   costo_por_kilo = costos_totales_del_lote / kg_producidos
 *
 * kg_producidos (si hay eventos de ingreso o egreso):
 *   kg_producidos = kg_salida + kg_stock_actual - kg_ingreso
 *
 * kg_producidos (sin movimientos — solo pesajes):
 *   kg_producidos = ultimo_pesaje.pesoTotal - primer_pesaje.pesoTotal
 *
 * tieneDatosSuficientes: mínimo 2 pesajes registrados
 *
 * División por cero: si kg_producidos <= 0 → costoPorKg = 0 (nunca NaN)
 * Solo aplica a lotes con actividad === 'ganaderia'
 */

import type { EventoRodeo } from '../types'

// ─── Domain types ───────────────────────────────────────────────────────────

/** Result of computing costo por kilo for a single ganaderia lote */
export interface CostoKiloLote {
  loteId: string
  nombre: string
  /** From lote.cabezas — used for $/cab metric */
  cabezas: number
  /** Sum of all EventoRodeo.costoTotal (non-deleted) */
  costosTotales: number
  /** Total kg entering from ingreso events */
  kgIngreso: number
  /** Total kg leaving from egreso events */
  kgSalida: number
  /** pesoTotal of the last pesaje event */
  kgStockActual: number
  /**
   * Effective kg produced:
   *   - With movements: kgSalida + kgStockActual - kgIngreso
   *   - Without movements: lastPesaje.pesoTotal - firstPesaje.pesoTotal
   *   Always >= 0 (floor at 0)
   */
  kgProducidos: number
  /** costosTotales / kgProducidos  (0 if kgProducidos === 0) */
  costoPorKg: number
  /** costosTotales / cabezas  (0 if cabezas === 0) */
  costoPorCab: number
  /** Fecha ISO of the first pesaje */
  primerPesajeFecha?: string
  /** Fecha ISO of the last pesaje */
  ultimoPesajeFecha?: string
  /** Total number of pesaje events */
  cantidadPesajes: number
  /** true when at least 2 pesajes are registered */
  tieneDatosSuficientes: boolean
}

/** Per-event line item for the expandable detail panel */
export interface CostoKiloDesglose {
  id: string
  fecha: string
  tipo: string
  concepto: string
  costoTotal: number
  /** Kilos attributed to this event (only for pesaje/ingreso/egreso) */
  kgAtribuidos?: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolve pesoTotal for a movement event: prefer explicit pesoTotal, else cantidadCabezas * pesoPromedio */
function resolveKg(evento: EventoRodeo): number {
  if (evento.pesoTotal != null && evento.pesoTotal > 0) return evento.pesoTotal
  if (evento.pesoPromedio != null && evento.cantidadCabezas > 0) {
    return evento.cantidadCabezas * evento.pesoPromedio
  }
  return 0
}

// ─── Single-lote computation ─────────────────────────────────────────────

/**
 * Computes CostoKiloLote for a single ganaderia lote.
 *
 * @param loteId   - ID of the lote
 * @param nombre   - Display name of the lote
 * @param cabezas  - Head count from lote.cabezas (or 0 if unknown)
 * @param eventos  - All EventoRodeo for this lote (may include deleted)
 */
export function computeCostoKiloLote(
  loteId: string,
  nombre: string,
  cabezas: number,
  eventos: EventoRodeo[],
): CostoKiloLote {
  // Filter out soft-deleted events for this lote
  const activos = eventos.filter(e => e.loteId === loteId && !e.deletedAt)

  // Sum all costs
  const costosTotales = activos.reduce((sum, e) => sum + e.costoTotal, 0)

  // Separate by event type
  const pesajes = activos
    .filter(e => e.tipo === 'pesaje')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const ingresos = activos.filter(e => e.tipo === 'ingreso')
  const egresos = activos.filter(e => e.tipo === 'egreso')

  const cantidadPesajes = pesajes.length
  const tieneDatosSuficientes = cantidadPesajes >= 2

  const primerPesaje = pesajes[0]
  const ultimoPesaje = pesajes[pesajes.length - 1]

  const kgStockActual = ultimoPesaje?.pesoTotal ?? 0

  // kg from movement events
  const kgIngreso = ingresos.reduce((sum, e) => sum + resolveKg(e), 0)
  const kgSalida = egresos.reduce((sum, e) => sum + resolveKg(e), 0)

  const hasMovimientos = ingresos.length > 0 || egresos.length > 0

  let kgProducidos: number
  if (hasMovimientos) {
    // Balance formula
    kgProducidos = kgSalida + kgStockActual - kgIngreso
  } else if (tieneDatosSuficientes && primerPesaje && ultimoPesaje) {
    // Gain from first to last weigh-in
    kgProducidos = (ultimoPesaje.pesoTotal ?? 0) - (primerPesaje.pesoTotal ?? 0)
  } else {
    kgProducidos = 0
  }

  // Floor at 0 — negative production is treated as no data
  kgProducidos = Math.max(0, kgProducidos)

  const costoPorKg = kgProducidos > 0 ? costosTotales / kgProducidos : 0
  const costoPorCab = cabezas > 0 ? costosTotales / cabezas : 0

  return {
    loteId,
    nombre,
    cabezas,
    costosTotales,
    kgIngreso,
    kgSalida,
    kgStockActual,
    kgProducidos,
    costoPorKg,
    costoPorCab,
    primerPesajeFecha: primerPesaje?.fecha,
    ultimoPesajeFecha: ultimoPesaje?.fecha,
    cantidadPesajes,
    tieneDatosSuficientes,
  }
}

// ─── Multi-lote computation ──────────────────────────────────────────────

/**
 * Computes CostoKiloLote for all ganaderia lotes.
 *
 * @param lotes   - All active lotes (only ganaderia ones will be included)
 * @param eventos - All EventoRodeo across all lotes for the tenant
 * @returns Array of CostoKiloLote sorted descending by costoPorKg
 */
export function computeCostoKiloAllLotes(
  lotes: Array<{ id: string; nombre: string; actividad: string; cabezas?: number }>,
  eventos: EventoRodeo[],
): CostoKiloLote[] {
  // Pre-group events by loteId for O(M) grouping
  const eventosPorLote = new Map<string, EventoRodeo[]>()
  for (const e of eventos) {
    if (e.deletedAt) continue
    const existing = eventosPorLote.get(e.loteId) ?? []
    existing.push(e)
    eventosPorLote.set(e.loteId, existing)
  }

  const result: CostoKiloLote[] = []

  for (const lote of lotes) {
    // Only include ganaderia lotes
    if (lote.actividad !== 'ganaderia') continue

    const loteEventos = eventosPorLote.get(lote.id) ?? []
    const row = computeCostoKiloLote(
      lote.id,
      lote.nombre,
      lote.cabezas ?? 0,
      // Pass all events already pre-filtered for this lote (none deleted)
      loteEventos.map(e => ({ ...e, loteId: lote.id })),
    )

    // Only include lotes that have at least some cost or data
    if (row.costosTotales > 0 || row.cantidadPesajes > 0) {
      result.push(row)
    }
  }

  // Sort descending by costoPorKg (lotes with data first)
  return result.sort((a, b) => b.costoPorKg - a.costoPorKg)
}

// ─── Detail desglose builder ─────────────────────────────────────────────

/** Human-readable label for an EventoRodeo tipo */
const TIPO_LABEL: Record<string, string> = {
  pesaje: 'Pesaje',
  vacunacion: 'Vacunación',
  desparasitacion: 'Desparasitación',
  curacion: 'Curación',
  servicio_toro: 'Servicio Toro',
  inseminacion: 'Inseminación',
  tacto: 'Tacto',
  paricion: 'Parición',
  destete: 'Destete',
  ingreso: 'Ingreso',
  egreso: 'Egreso',
  muerte: 'Muerte',
}

/**
 * Builds the sorted (descending by fecha) desglose list for a single lote.
 * Only includes events with costoTotal > 0.
 */
export function buildCostoKiloDesglose(
  loteId: string,
  eventos: EventoRodeo[],
): CostoKiloDesglose[] {
  const lineas: CostoKiloDesglose[] = []

  for (const e of eventos) {
    if (e.loteId !== loteId || e.deletedAt) continue

    const concepto = e.productoSanitario
      ? `${TIPO_LABEL[e.tipo] ?? e.tipo} — ${e.productoSanitario}`
      : `${TIPO_LABEL[e.tipo] ?? e.tipo} (${e.cantidadCabezas} cab.)`

    let kgAtribuidos: number | undefined
    if (e.tipo === 'pesaje' && e.pesoTotal != null) {
      kgAtribuidos = e.pesoTotal
    } else if (e.tipo === 'ingreso' || e.tipo === 'egreso') {
      const kg = resolveKg(e)
      if (kg > 0) kgAtribuidos = kg
    }

    lineas.push({
      id: e.id,
      fecha: e.fecha,
      tipo: e.tipo,
      concepto,
      costoTotal: e.costoTotal,
      kgAtribuidos,
    })
  }

  return lineas.sort((a, b) => b.fecha.localeCompare(a.fecha))
}
