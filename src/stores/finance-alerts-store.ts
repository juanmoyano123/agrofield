import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FinanceAlertsState {
  gastoMensualMax: number | null   // alerta si gasto ARS mensual supera este valor
  costoPorHaMax: number | null     // alerta si costo/ha de algún lote supera este valor
  cashflowNetoMin: number | null   // alerta si saldo neto mensual baja de este valor
  dismissedAlerts: string[]        // session-only — NOT persisted
}

interface FinanceAlertsActions {
  setGastoMensualMax: (v: number | null) => void
  setCostoPorHaMax: (v: number | null) => void
  setCashflowNetoMin: (v: number | null) => void
  dismissAlert: (id: string) => void
  resetDismissed: () => void
}

export const useFinanceAlertsStore = create<FinanceAlertsState & FinanceAlertsActions>()(
  persist(
    (set) => ({
      gastoMensualMax: null,
      costoPorHaMax: null,
      cashflowNetoMin: null,
      dismissedAlerts: [],
      setGastoMensualMax: (v) => set({ gastoMensualMax: v }),
      setCostoPorHaMax: (v) => set({ costoPorHaMax: v }),
      setCashflowNetoMin: (v) => set({ cashflowNetoMin: v }),
      dismissAlert: (id) => set(s => ({ dismissedAlerts: [...s.dismissedAlerts, id] })),
      resetDismissed: () => set({ dismissedAlerts: [] }),
    }),
    {
      name: 'agrofield-finance-alert-thresholds',
      // Only persist thresholds — dismissedAlerts is session-only
      partialize: (s) => ({
        gastoMensualMax: s.gastoMensualMax,
        costoPorHaMax: s.costoPorHaMax,
        cashflowNetoMin: s.cashflowNetoMin,
      }),
    },
  ),
)
