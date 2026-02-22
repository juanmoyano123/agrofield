/**
 * F-005: Motor de Imputacion — utilities for computing derived costs per lote.
 *
 * Cost attribution strategy:
 *   - Eventos (field operations with inputs): summed by loteId from costoTotal
 *   - TrabajoContratista (contractor jobs): summed by loteId from costo
 *
 * All computations are O(M+K) — single-pass pre-grouping by loteId,
 * then a final pass over lotes to build the result map.
 * Deleted records (deletedAt set) are excluded.
 */

import type { Evento } from '../types'
import type { TrabajoContratista } from '../types'

// ─── Domain types ──────────────────────────────────────────────────────────

/** Aggregated cost breakdown for a single lote */
export interface CostoLote {
  loteId: string
  /** Total cost from Eventos (insumos + costoManual) */
  costoEventos: number
  /** Total cost from TrabajoContratista records */
  costoTrabajos: number
  /** costoEventos + costoTrabajos */
  costoTotal: number
  /** costoTotal divided by hectareas (0 if hectareas <= 0) */
  costoPorHa: number
}

/** A single line-item cost entry for the detail view of a lote */
export interface LineaCosto {
  id: string
  fecha: string
  concepto: string
  tipo: 'evento' | 'trabajo'
  cantidad?: number
  unidad?: string
  costoUnitario?: number
  subtotal: number
}

// ─── Multi-lote aggregation (O(M+K)) ──────────────────────────────────────

/**
 * Computes costs for all lotes in a single O(M+K) pass.
 *
 * @param lotes - Array of lote objects with id and hectareas
 * @param eventos - All eventos from the store (may include deleted)
 * @param trabajos - All trabajos from the store (may include deleted)
 * @returns Map<loteId, CostoLote> — one entry per lote
 */
export function computeCostosAllLotes(
  lotes: Array<{ id: string; hectareas: number }>,
  eventos: Evento[],
  trabajos: TrabajoContratista[],
): Map<string, CostoLote> {
  // Pre-group evento costs by loteId — O(M)
  const eventosPorLote = new Map<string, number>()
  for (const e of eventos) {
    if (e.deletedAt) continue
    eventosPorLote.set(e.loteId, (eventosPorLote.get(e.loteId) ?? 0) + e.costoTotal)
  }

  // Pre-group trabajo costs by loteId — O(K)
  const trabajosPorLote = new Map<string, number>()
  for (const t of trabajos) {
    if (t.deletedAt || !t.loteId) continue
    trabajosPorLote.set(t.loteId, (trabajosPorLote.get(t.loteId) ?? 0) + t.costo)
  }

  // Build result map — O(L)
  const map = new Map<string, CostoLote>()
  for (const lote of lotes) {
    const costoEventos = eventosPorLote.get(lote.id) ?? 0
    const costoTrabajos = trabajosPorLote.get(lote.id) ?? 0
    const costoTotal = costoEventos + costoTrabajos
    map.set(lote.id, {
      loteId: lote.id,
      costoEventos,
      costoTrabajos,
      costoTotal,
      costoPorHa: lote.hectareas > 0 ? costoTotal / lote.hectareas : 0,
    })
  }

  return map
}

// ─── Single-lote helpers ──────────────────────────────────────────────────

/**
 * Computes cost breakdown for a single lote.
 * Prefer computeCostosAllLotes when iterating multiple lotes.
 */
export function computeCostoLote(
  loteId: string,
  hectareas: number,
  eventos: Evento[],
  trabajos: TrabajoContratista[],
): CostoLote {
  const costoEventos = eventos
    .filter(e => e.loteId === loteId && !e.deletedAt)
    .reduce((sum, e) => sum + e.costoTotal, 0)

  const costoTrabajos = trabajos
    .filter(t => t.loteId === loteId && !t.deletedAt)
    .reduce((sum, t) => sum + t.costo, 0)

  const costoTotal = costoEventos + costoTrabajos

  return {
    loteId,
    costoEventos,
    costoTrabajos,
    costoTotal,
    costoPorHa: hectareas > 0 ? costoTotal / hectareas : 0,
  }
}

/**
 * Builds a sorted (descending by fecha) list of line-item cost entries
 * for a single lote, merging eventos and trabajos.
 */
export function buildLineasCosto(
  loteId: string,
  eventos: Evento[],
  trabajos: TrabajoContratista[],
): LineaCosto[] {
  const lineas: LineaCosto[] = []

  // Add evento lines — each evento maps to one line using its first insumo label
  // or costoManual description as the concepto
  for (const e of eventos) {
    if (e.loteId !== loteId || e.deletedAt) continue

    const concepto = e.insumos.length > 0
      ? e.insumos.map(i => i.productoName).join(', ')
      : `${e.tipo.charAt(0).toUpperCase()}${e.tipo.slice(1)}`

    lineas.push({
      id: e.id,
      fecha: e.fecha,
      concepto,
      tipo: 'evento',
      subtotal: e.costoTotal,
    })
  }

  // Add trabajo lines
  for (const t of trabajos) {
    if (t.loteId !== loteId || t.deletedAt) continue

    lineas.push({
      id: t.id,
      fecha: t.fecha,
      concepto: `${t.tipo.charAt(0).toUpperCase()}${t.tipo.slice(1)} — ${t.contratistaNombre}`,
      tipo: 'trabajo',
      subtotal: t.costo,
    })
  }

  // Sort descending by fecha (most recent first)
  return lineas.sort((a, b) => b.fecha.localeCompare(a.fecha))
}
