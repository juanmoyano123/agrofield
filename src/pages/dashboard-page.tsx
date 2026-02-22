import { useEffect } from 'react'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { GastoProveedorWidget } from '../components/dashboard/gasto-proveedor-widget'
import { Spinner } from '../components/ui/spinner'

export function DashboardPage() {
  const { user } = useAuth()
  const { isLoading, fetchCompras, fetchProveedores } = useCompras()

  useEffect(() => {
    if (!user) return
    void fetchCompras(user.tenantId)
    void fetchProveedores(user.tenantId)
  }, [user, fetchCompras, fetchProveedores])

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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <GastoProveedorWidget />
        </div>
      )}
    </div>
  )
}
