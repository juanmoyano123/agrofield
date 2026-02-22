import { useEffect } from 'react'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { useEventos } from '../hooks/use-eventos'
import { useTrabajosStore } from '../stores/contratistas-store'
import { GastoProveedorWidget } from '../components/dashboard/gasto-proveedor-widget'
import { CashflowWidget } from '../components/dashboard/cashflow-widget'
import { CostoLotesWidget } from '../components/dashboard/costo-lotes-widget'
import { Spinner } from '../components/ui/spinner'

export function DashboardPage() {
  const { user } = useAuth()
  const { isLoading, fetchCompras, fetchProveedores } = useCompras()

  // F-005: Fetch all eventos for the imputacion engine
  const { fetchAllEventos } = useEventos()

  // Load trabajos so CashflowWidget and CostoLotesWidget have data
  const { isLoading: isLoadingTrabajos, fetchTrabajos } = useTrabajosStore((s) => ({
    isLoading: s.isLoading,
    fetchTrabajos: s.fetchTrabajos,
  }))

  useEffect(() => {
    if (!user) return
    void fetchCompras(user.tenantId)
    void fetchProveedores(user.tenantId)
    void fetchTrabajos(user.tenantId)
    // F-005: Load all eventos so imputacion engine can compute costs per lote
    void fetchAllEventos(user.tenantId)
  }, [user, fetchCompras, fetchProveedores, fetchTrabajos, fetchAllEventos])

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
          Bienvenido, {user?.name ?? 'usuario'}
        </h1>
        {user?.tenantName && (
          <p className="text-sm text-text-muted mt-1">{user.tenantName}</p>
        )}
      </div>

      {(isLoading || isLoadingTrabajos) ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <GastoProveedorWidget />
          <CostoLotesWidget />
          <CashflowWidget />
        </div>
      )}
    </div>
  )
}
