import type { Compra, TrabajoContratista } from '../types'

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
