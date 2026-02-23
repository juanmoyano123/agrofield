import type { Compra, TrabajoContratista, Evento, Producto, CategoriaProducto } from '../types'
import { computeCostosAllLotes } from './imputacion-utils'

export type PeriodOption = 'this-month' | 'last-3' | 'last-6' | 'this-year' | 'all'

export interface ProveedorGastoItem {
  proveedorId: string
  proveedorName: string
  totalARS: number
  totalUSD: number
  cantidadCompras: number
  porcentaje: number
}

/**
 * Returns the date range for a given period option.
 * Returns null for 'all' (no filtering).
 */
export function getPeriodRange(period: PeriodOption): { desde: Date; hasta: Date } | null {
  if (period === 'all') return null

  const hasta = new Date()
  // Set hasta to end of today
  hasta.setHours(23, 59, 59, 999)

  const desde = new Date()

  switch (period) {
    case 'this-month':
      desde.setDate(1)
      desde.setHours(0, 0, 0, 0)
      break
    case 'last-3':
      desde.setMonth(desde.getMonth() - 3)
      desde.setHours(0, 0, 0, 0)
      break
    case 'last-6':
      desde.setMonth(desde.getMonth() - 6)
      desde.setHours(0, 0, 0, 0)
      break
    case 'this-year':
      desde.setMonth(0, 1)
      desde.setHours(0, 0, 0, 0)
      break
  }

  return { desde, hasta }
}

/**
 * Computes spending per supplier from a list of purchases.
 * Filters by period, groups by proveedorId, separates ARS/USD totals,
 * calculates each supplier's percentage of total ARS spend, and sorts desc by totalARS.
 */
export function computeGastoPorProveedor(
  compras: Compra[],
  periodo: PeriodOption,
): ProveedorGastoItem[] {
  const range = getPeriodRange(periodo)

  // Filter by date range if a period is set
  const filtered = range
    ? compras.filter((c) => {
        // compra.fecha is a YYYY-MM-DD string; parse as local date
        const [year, month, day] = c.fecha.split('-').map(Number)
        const fecha = new Date(year, month - 1, day)
        return fecha >= range.desde && fecha <= range.hasta
      })
    : compras

  if (filtered.length === 0) return []

  // Group by proveedorId
  const grouped = filtered.reduce<
    Record<
      string,
      { proveedorId: string; proveedorName: string; totalARS: number; totalUSD: number; cantidadCompras: number }
    >
  >((acc, compra) => {
    const key = compra.proveedorId

    if (!acc[key]) {
      acc[key] = {
        proveedorId: compra.proveedorId,
        proveedorName: compra.proveedorName,
        totalARS: 0,
        totalUSD: 0,
        cantidadCompras: 0,
      }
    }

    if (compra.moneda === 'ARS') {
      acc[key].totalARS += compra.total
    } else {
      acc[key].totalUSD += compra.total
    }

    acc[key].cantidadCompras += 1

    return acc
  }, {})

  const items = Object.values(grouped)

  // Total global ARS for percentage calculation
  const totalGlobalARS = items.reduce((sum, item) => sum + item.totalARS, 0)

  // Build final list with percentage
  const result: ProveedorGastoItem[] = items.map((item) => ({
    ...item,
    porcentaje: totalGlobalARS > 0 ? (item.totalARS / totalGlobalARS) * 100 : 0,
  }))

  // Sort descending by totalARS
  result.sort((a, b) => b.totalARS - a.totalARS)

  return result
}

// ---------------------------------------------------------------------------
// F-008: Cashflow del Período
// ---------------------------------------------------------------------------

export interface CashflowMensualItem {
  mes: string              // e.g. "Ene 2026"
  mesKey: number           // e.g. 202601
  ingresos: number         // placeholder — always 0 until F-012
  egresosCompras: number
  egresosTrabajos: number
  egresosTotal: number
  neto: number             // ingresos - egresosTotal
}

export interface CashflowSummary {
  totalIngresos: number
  totalEgresosCompras: number
  totalEgresosTrabajos: number
  totalEgresos: number
  saldoNeto: number
  mensual: CashflowMensualItem[]
}

/**
 * Converts a YYYY-MM-DD date string to a numeric month key (YYYYMM).
 * Falls back to 202601 if parsing fails.
 */
function parseFechaToMonthKey(fecha: string): number {
  const parts = fecha.split('-').map(Number)
  return (parts[0] ?? 2026) * 100 + (parts[1] ?? 1)
}

/**
 * Converts a numeric month key (YYYYMM) to a human-readable label like "Ene 2026".
 */
function monthKeyToLabel(key: number): string {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[(key % 100) - 1] ?? 'Ene'} ${Math.floor(key / 100)}`
}

/**
 * Aggregates compras and trabajos by month for the selected period and currency,
 * producing a CashflowSummary with per-month breakdowns and totals.
 *
 * Notes:
 * - Ingresos are always 0 (pending F-012 ventas feature).
 * - Trabajos are always ARS; they are excluded when moneda = 'USD'.
 * - Soft-deleted trabajos (deletedAt set) are always excluded.
 */
export function computeCashflow(
  compras: Compra[],
  trabajos: TrabajoContratista[],
  periodo: PeriodOption,
  moneda: 'ARS' | 'USD',
): CashflowSummary {
  const range = getPeriodRange(periodo)

  // Filter compras: only matching currency + within period
  const comprasFiltradas = compras.filter((c) => {
    if (c.moneda !== moneda) return false
    if (!range) return true
    return c.fecha >= range.desde.toISOString().slice(0, 10) &&
           c.fecha <= range.hasta.toISOString().slice(0, 10)
  })

  // Trabajos are ARS-only; exclude entirely when viewing USD
  const trabajosFiltrados = moneda === 'ARS'
    ? trabajos.filter((t) => {
        if (t.deletedAt) return false
        if (!range) return true
        return t.fecha >= range.desde.toISOString().slice(0, 10) &&
               t.fecha <= range.hasta.toISOString().slice(0, 10)
      })
    : []

  // Build per-month aggregation map
  const byMonth = new Map<number, { compras: number; trabajos: number }>()

  for (const c of comprasFiltradas) {
    const key = parseFechaToMonthKey(c.fecha)
    const prev = byMonth.get(key) ?? { compras: 0, trabajos: 0 }
    byMonth.set(key, { ...prev, compras: prev.compras + c.total })
  }

  for (const t of trabajosFiltrados) {
    const key = parseFechaToMonthKey(t.fecha)
    const prev = byMonth.get(key) ?? { compras: 0, trabajos: 0 }
    byMonth.set(key, { ...prev, trabajos: prev.trabajos + t.costo })
  }

  // Build sorted monthly array
  const sortedKeys = Array.from(byMonth.keys()).sort((a, b) => a - b)
  const mensual: CashflowMensualItem[] = sortedKeys.map((key) => {
    const data = byMonth.get(key)!
    return {
      mes: monthKeyToLabel(key),
      mesKey: key,
      ingresos: 0,
      egresosCompras: data.compras,
      egresosTrabajos: data.trabajos,
      egresosTotal: data.compras + data.trabajos,
      neto: -(data.compras + data.trabajos),
    }
  })

  // Compute overall totals
  const totals = mensual.reduce(
    (acc, m) => ({
      compras: acc.compras + m.egresosCompras,
      trabajos: acc.trabajos + m.egresosTrabajos,
    }),
    { compras: 0, trabajos: 0 },
  )

  return {
    totalIngresos: 0,
    totalEgresosCompras: totals.compras,
    totalEgresosTrabajos: totals.trabajos,
    totalEgresos: totals.compras + totals.trabajos,
    saldoNeto: -(totals.compras + totals.trabajos),
    mensual,
  }
}

// ---------------------------------------------------------------------------
// F-007: Costo por Lote — period-aware aggregation
// ---------------------------------------------------------------------------

/** One row per lote in the Costo por Lote dashboard widget */
export interface CostoLoteRow {
  loteId: string
  nombre: string
  hectareas: number
  costoEventos: number
  costoTrabajos: number
  costoTotal: number
  costoPorHa: number
}

/**
 * Computes cost-per-lote rows filtered to the given period.
 *
 * Filtering is applied to eventos and trabajos before aggregation so that
 * only records within the selected date range contribute to the totals.
 * Rows with zero total cost are excluded. Results are sorted descending
 * by costoPorHa (highest first).
 *
 * @param lotes   - Active lotes (id, nombre, hectareas)
 * @param eventos - All eventos from the store (including deleted)
 * @param trabajos - All trabajos from the store (including deleted)
 * @param periodo - Period option for date-range filtering
 */
export function computeCostosAllLotesByPeriod(
  lotes: Array<{ id: string; nombre: string; hectareas: number }>,
  eventos: Evento[],
  trabajos: TrabajoContratista[],
  periodo: PeriodOption,
): CostoLoteRow[] {
  const range = getPeriodRange(periodo)

  // Filter eventos by date range and exclude soft-deleted records
  const eventosFiltrados = range
    ? eventos.filter(
        e =>
          !e.deletedAt &&
          e.fecha >= range.desde.toISOString().slice(0, 10) &&
          e.fecha <= range.hasta.toISOString().slice(0, 10),
      )
    : eventos.filter(e => !e.deletedAt)

  // Filter trabajos by date range and exclude soft-deleted records
  const trabajosFiltrados = range
    ? trabajos.filter(
        t =>
          !t.deletedAt &&
          t.fecha >= range.desde.toISOString().slice(0, 10) &&
          t.fecha <= range.hasta.toISOString().slice(0, 10),
      )
    : trabajos.filter(t => !t.deletedAt)

  // Delegate to the O(M+K) aggregation engine
  const costosMap = computeCostosAllLotes(lotes, eventosFiltrados, trabajosFiltrados)

  return lotes
    .map(lote => {
      const costo = costosMap.get(lote.id) ?? {
        loteId: lote.id,
        costoEventos: 0,
        costoTrabajos: 0,
        costoTotal: 0,
        costoPorHa: 0,
      }
      return {
        ...costo,
        nombre: lote.nombre,
        hectareas: lote.hectareas,
      }
    })
    // Drop lotes with no costs in this period
    .filter(r => r.costoTotal > 0)
    // Highest $/ha first
    .sort((a, b) => b.costoPorHa - a.costoPorHa)
}

// ---------------------------------------------------------------------------
// F-027: Comparativa entre Campañas — date-range variant of computeCostosAllLotesByPeriod
// ---------------------------------------------------------------------------

/**
 * Computes cost-per-lote rows for a custom date range (instead of a PeriodOption).
 *
 * Used by the Comparativa feature where date ranges come from user-defined Campañas
 * rather than a predefined period dropdown. Internally reuses the same aggregation
 * engine as computeCostosAllLotesByPeriod.
 *
 * @param lotes   - Active lotes (id, nombre, hectareas)
 * @param eventos - All eventos from the store (including deleted)
 * @param trabajos - All trabajos from the store (including deleted)
 * @param dateRange - Custom date range {desde: 'YYYY-MM-DD', hasta: 'YYYY-MM-DD'}
 */
export function computeCostosAllLotesByDateRange(
  lotes: Array<{ id: string; nombre: string; hectareas: number }>,
  eventos: Evento[],
  trabajos: TrabajoContratista[],
  dateRange: { desde: string; hasta: string },
): CostoLoteRow[] {
  const { desde, hasta } = dateRange

  // Filter eventos by date range and exclude soft-deleted records
  const eventosFiltrados = eventos.filter(
    e => !e.deletedAt && e.fecha >= desde && e.fecha <= hasta,
  )

  // Filter trabajos by date range and exclude soft-deleted records
  const trabajosFiltrados = trabajos.filter(
    t => !t.deletedAt && t.fecha >= desde && t.fecha <= hasta,
  )

  // Delegate to the O(M+K) aggregation engine
  const costosMap = computeCostosAllLotes(lotes, eventosFiltrados, trabajosFiltrados)

  return lotes
    .map(lote => {
      const costo = costosMap.get(lote.id) ?? {
        loteId: lote.id,
        costoEventos: 0,
        costoTrabajos: 0,
        costoTotal: 0,
        costoPorHa: 0,
      }
      return {
        ...costo,
        nombre: lote.nombre,
        hectareas: lote.hectareas,
      }
    })
    // Include all lotes (even zero cost ones) for complete comparison table
    .sort((a, b) => b.costoPorHa - a.costoPorHa)
}

// ---------------------------------------------------------------------------
// F-015: Evolución de Gastos — stacked AreaChart by product category
// ---------------------------------------------------------------------------

/** One row per month, breaking down spend by insumo category and contratistas. */
export interface GastoCategoriaMensual {
  mes: string          // e.g. "Ene 2026"
  mesKey: number       // e.g. 202601
  semilla: number
  herbicida: number
  insecticida: number
  fertilizante: number
  otro: number         // compras with no category or category 'otro'
  contratistas: number // trabajos cost in this period (ARS only)
  total: number
}

export interface EvolucionGastosSummary {
  mensual: GastoCategoriaMensual[]
  promedioMensual: number
  totalPeriodo: number
}

/**
 * Aggregates compras (by product category) and trabajos (contratistas) by month
 * for the selected period and currency.
 *
 * Notes:
 * - Each CompraItem is mapped to its product's categoria via productoMap.
 * - Productos with null categoria fall into the 'otro' bucket.
 * - Trabajos are always ARS; they are excluded when moneda = 'USD'.
 * - Soft-deleted trabajos (deletedAt set) are always excluded.
 */
export function computeEvolucionGastos(
  compras: Compra[],
  trabajos: TrabajoContratista[],
  productos: Producto[],
  periodo: PeriodOption,
  moneda: 'ARS' | 'USD',
): EvolucionGastosSummary {
  const range = getPeriodRange(periodo)

  // Build a fast lookup: productoId -> categoria
  const productoMap = new Map<string, CategoriaProducto | null>(
    productos.map(p => [p.id, p.categoria]),
  )

  // Filter compras: only matching currency + within period
  const comprasFiltradas = compras.filter(c => {
    if (c.moneda !== moneda) return false
    if (!range) return true
    return (
      c.fecha >= range.desde.toISOString().slice(0, 10) &&
      c.fecha <= range.hasta.toISOString().slice(0, 10)
    )
  })

  // Trabajos are ARS-only; exclude entirely when viewing USD
  const trabajosFiltrados =
    moneda === 'ARS'
      ? trabajos.filter(t => {
          if (t.deletedAt) return false
          if (!range) return true
          return (
            t.fecha >= range.desde.toISOString().slice(0, 10) &&
            t.fecha <= range.hasta.toISOString().slice(0, 10)
          )
        })
      : []

  // Per-month accumulator
  const byMonth = new Map<number, GastoCategoriaMensual>()

  const getOrCreate = (key: number): GastoCategoriaMensual => {
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        mes: monthKeyToLabel(key),
        mesKey: key,
        semilla: 0,
        herbicida: 0,
        insecticida: 0,
        fertilizante: 0,
        otro: 0,
        contratistas: 0,
        total: 0,
      })
    }
    return byMonth.get(key)!
  }

  // Accumulate compra items by category
  for (const compra of comprasFiltradas) {
    const key = parseFechaToMonthKey(compra.fecha)
    const row = getOrCreate(key)

    for (const item of compra.items) {
      const cat = productoMap.get(item.productoId) ?? 'otro'
      const val = item.subtotal

      switch (cat) {
        case 'semilla':
          row.semilla += val
          break
        case 'herbicida':
          row.herbicida += val
          break
        case 'insecticida':
          row.insecticida += val
          break
        case 'fertilizante':
          row.fertilizante += val
          break
        default:
          row.otro += val
      }

      row.total += val
    }
  }

  // Accumulate trabajos as contratistas cost
  for (const t of trabajosFiltrados) {
    const key = parseFechaToMonthKey(t.fecha)
    const row = getOrCreate(key)
    row.contratistas += t.costo
    row.total += t.costo
  }

  // Sort chronologically
  const mensual = Array.from(byMonth.values()).sort((a, b) => a.mesKey - b.mesKey)
  const totalPeriodo = mensual.reduce((s, m) => s + m.total, 0)
  const promedioMensual = mensual.length > 0 ? Math.round(totalPeriodo / mensual.length) : 0

  return { mensual, promedioMensual, totalPeriodo }
}
