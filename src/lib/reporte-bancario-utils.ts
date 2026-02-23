/**
 * F-028: Reporte Bancario/Crediticio — Utility functions
 *
 * Pure aggregation functions for generating the bank/credit report.
 * These complement the existing dashboard-utils.ts functions, adding
 * report-specific metrics that are not needed by the dashboard widgets.
 */

import type { Evento, TipoEvento } from '../types'
import type { TrabajoContratista } from '../types'
import type { Compra } from '../types'
import type { Lote } from '../types'
import { getPeriodRange, type PeriodOption } from './dashboard-utils'

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

/**
 * Formats a numeric amount into a localized currency string.
 *
 * Examples:
 *   formatCurrency(45320, 'ARS')  →  "$ 45.320,00"
 *   formatCurrency(1200.5, 'USD') →  "U$S 1.200,50"
 */
export function formatCurrency(amount: number, moneda: 'ARS' | 'USD'): string {
  const formatted = amount.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return moneda === 'ARS' ? `$ ${formatted}` : `U$S ${formatted}`
}

// ---------------------------------------------------------------------------
// computeResumenGeneral
// ---------------------------------------------------------------------------

export interface ResumenGeneral {
  totalHectareas: number
  cantidadLotes: number
  inversionTotal: number   // ARS: compras ARS + trabajos
  costoPorHa: number       // inversionTotal / totalHectareas
}

/**
 * Computes the 4 top-level KPIs for the executive summary section.
 *
 * - totalHectareas: sum of hectareas across all active (non-deleted) lotes
 * - cantidadLotes: count of active lotes
 * - inversionTotal: sum of ARS compras + trabajos costs in the selected period
 * - costoPorHa: inversionTotal / totalHectareas (0 if no hectareas)
 */
export function computeResumenGeneral(
  lotes: Lote[],
  compras: Compra[],
  trabajos: TrabajoContratista[],
  periodo: PeriodOption,
): ResumenGeneral {
  const activeLotes = lotes.filter(l => !l.deletedAt)
  const totalHectareas = activeLotes.reduce((sum, l) => sum + l.hectareas, 0)
  const cantidadLotes = activeLotes.length

  const range = getPeriodRange(periodo)

  // Sum ARS compras within period
  const totalComprasARS = compras
    .filter(c => {
      if (c.moneda !== 'ARS') return false
      if (!range) return true
      return c.fecha >= range.desde.toISOString().slice(0, 10) &&
             c.fecha <= range.hasta.toISOString().slice(0, 10)
    })
    .reduce((sum, c) => sum + c.total, 0)

  // Sum trabajos (always ARS) within period, excluding soft-deleted
  const totalTrabajos = trabajos
    .filter(t => {
      if (t.deletedAt) return false
      if (!range) return true
      return t.fecha >= range.desde.toISOString().slice(0, 10) &&
             t.fecha <= range.hasta.toISOString().slice(0, 10)
    })
    .reduce((sum, t) => sum + t.costo, 0)

  const inversionTotal = totalComprasARS + totalTrabajos
  const costoPorHa = totalHectareas > 0 ? Math.round(inversionTotal / totalHectareas) : 0

  return { totalHectareas, cantidadLotes, inversionTotal, costoPorHa }
}

// ---------------------------------------------------------------------------
// computeActividadResumen
// ---------------------------------------------------------------------------

export interface ActividadItem {
  tipo: TipoEvento
  label: string
  cantidad: number
}

export interface ActividadResumen {
  items: ActividadItem[]
  totalEventos: number
}

/** Human-readable labels for each event type */
const TIPO_LABELS: Record<TipoEvento, string> = {
  siembra: 'Siembra',
  aplicacion: 'Aplicación',
  cosecha: 'Cosecha',
  monitoreo: 'Monitoreo',
  servicio: 'Servicio',
  riego: 'Riego',
  otro: 'Otro',
}

/**
 * Groups eventos by type and counts totals for the selected period.
 * Only active (non-deleted) eventos are counted.
 * Result is sorted descending by cantidad.
 */
export function computeActividadResumen(
  eventos: Evento[],
  periodo: PeriodOption,
): ActividadResumen {
  const range = getPeriodRange(periodo)

  const filtered = eventos.filter(e => {
    if (e.deletedAt) return false
    if (!range) return true
    return e.fecha >= range.desde.toISOString().slice(0, 10) &&
           e.fecha <= range.hasta.toISOString().slice(0, 10)
  })

  if (filtered.length === 0) {
    return { items: [], totalEventos: 0 }
  }

  // Count by type
  const counts = new Map<TipoEvento, number>()
  for (const e of filtered) {
    counts.set(e.tipo, (counts.get(e.tipo) ?? 0) + 1)
  }

  const items: ActividadItem[] = Array.from(counts.entries())
    .map(([tipo, cantidad]) => ({
      tipo,
      label: TIPO_LABELS[tipo] ?? tipo,
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)

  return { items, totalEventos: filtered.length }
}
