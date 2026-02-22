import type { Compra } from '../types'

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
