import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StockAlertsState {
  thresholds: Record<string, number>  // { [productoId]: umbral }
  dismissedAlerts: string[]           // productoIds dismissed en sesion actual
}

interface StockAlertsActions {
  setThreshold: (productoId: string, umbral: number) => void
  removeThreshold: (productoId: string) => void
  dismissAlert: (productoId: string) => void
  resetDismissed: () => void
}

export const useStockAlertsStore = create<StockAlertsState & StockAlertsActions>()(
  persist(
    (set) => ({
      thresholds: {},
      dismissedAlerts: [],
      setThreshold: (id, umbral) =>
        set(s => ({ thresholds: { ...s.thresholds, [id]: umbral } })),
      removeThreshold: (id) =>
        set(s => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = s.thresholds
          return { thresholds: rest }
        }),
      dismissAlert: (id) =>
        set(s => ({ dismissedAlerts: [...s.dismissedAlerts, id] })),
      resetDismissed: () => set({ dismissedAlerts: [] }),
    }),
    {
      name: 'agrofield-stock-alert-thresholds',
      // Only persist thresholds — dismissedAlerts is session-only
      partialize: (s) => ({ thresholds: s.thresholds }),
    }
  )
)
