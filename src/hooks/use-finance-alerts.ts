import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useComprasStore } from '../stores/compras-store'
import { useTrabajosStore } from '../stores/contratistas-store'
import { useLotesStore } from '../stores/lotes-store'
import { useEventosStore } from '../stores/eventos-store'
import { useFinanceAlertsStore } from '../stores/finance-alerts-store'
import { computeCashflow, computeCostosAllLotesByPeriod } from '../lib/dashboard-utils'

export interface FinanceAlert {
  id: string
  mensaje: string
  valorActual: number
  umbral: number
  tipo: 'error' | 'warning'
}

/**
 * Derives the list of active finance alerts by comparing current computed
 * values (cashflow, cost-per-ha) against the configured thresholds.
 *
 * Alerts that have been dismissed in the current session are filtered out.
 * The hook is memoized so it only recomputes when its inputs change.
 */
export function useFinanceAlerts(): FinanceAlert[] {
  const compras = useComprasStore(useShallow(s => s.compras))
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos))
  const lotes = useLotesStore(useShallow(s => s.lotes.filter(l => !l.deletedAt)))
  const eventos = useEventosStore(useShallow(s => s.eventos))
  const { gastoMensualMax, costoPorHaMax, cashflowNetoMin, dismissedAlerts } =
    useFinanceAlertsStore()

  return useMemo(() => {
    const alerts: FinanceAlert[] = []

    // Cashflow-based alerts — only compute when at least one threshold is set
    if (gastoMensualMax !== null || cashflowNetoMin !== null) {
      const cashflow = computeCashflow(compras, trabajos, 'this-month', 'ARS')

      if (gastoMensualMax !== null && cashflow.totalEgresos > gastoMensualMax) {
        alerts.push({
          id: 'gasto-mensual',
          tipo: 'error',
          mensaje: `Gasto mensual ($${cashflow.totalEgresos.toLocaleString('es-AR')}) superó el umbral de $${gastoMensualMax.toLocaleString('es-AR')}`,
          valorActual: cashflow.totalEgresos,
          umbral: gastoMensualMax,
        })
      }

      if (cashflowNetoMin !== null && cashflow.saldoNeto < cashflowNetoMin) {
        alerts.push({
          id: 'cashflow-neto',
          tipo: 'warning',
          mensaje: `Saldo neto ($${cashflow.saldoNeto.toLocaleString('es-AR')}) por debajo del mínimo de $${cashflowNetoMin.toLocaleString('es-AR')}`,
          valorActual: cashflow.saldoNeto,
          umbral: cashflowNetoMin,
        })
      }
    }

    // Per-lote cost-per-ha alerts
    if (costoPorHaMax !== null) {
      const costos = computeCostosAllLotesByPeriod(lotes, eventos, trabajos, 'this-month')
      for (const row of costos) {
        if (row.costoPorHa > costoPorHaMax) {
          alerts.push({
            id: `costo-lote-${row.loteId}`,
            tipo: 'warning',
            mensaje: `${row.nombre}: costo/ha $${Math.round(row.costoPorHa).toLocaleString('es-AR')} supera umbral de $${costoPorHaMax.toLocaleString('es-AR')}/ha`,
            valorActual: row.costoPorHa,
            umbral: costoPorHaMax,
          })
        }
      }
    }

    return alerts.filter(a => !dismissedAlerts.includes(a.id))
  }, [compras, trabajos, lotes, eventos, gastoMensualMax, costoPorHaMax, cashflowNetoMin, dismissedAlerts])
}
