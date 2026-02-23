import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { useEventos } from '../hooks/use-eventos'
import { useTrabajosStore } from '../stores/contratistas-store'
import { useRodeoStore } from '../stores/rodeo-store'
import { GastoProveedorWidget } from '../components/dashboard/gasto-proveedor-widget'
import { CashflowWidget } from '../components/dashboard/cashflow-widget'
import { CostoLotesWidget } from '../components/dashboard/costo-lotes-widget'
import { EvolucionGastosWidget } from '../components/dashboard/evolucion-gastos-widget'
import { CostoKiloWidget } from '../components/dashboard/costo-kilo-widget'
import { FinanceAlertsBanner } from '../components/dashboard/finance-alerts-banner'
import { FinanceAlertsConfig } from '../components/dashboard/finance-alerts-config'
import { Spinner } from '../components/ui/spinner'
import { useFinanceAlerts } from '../hooks/use-finance-alerts'
import { useFinanceAlertsStore } from '../stores/finance-alerts-store'

export function DashboardPage() {
  const { user } = useAuth()
  const { isLoading, fetchCompras, fetchProveedores, fetchProductos } = useCompras()

  // F-022: Finance alerts
  const alerts = useFinanceAlerts()
  const dismissAlert = useFinanceAlertsStore(s => s.dismissAlert)

  // F-005: Fetch all eventos for the imputacion engine
  const { fetchAllEventos } = useEventos()

  // Load trabajos so CashflowWidget and CostoLotesWidget have data
  const { isLoading: isLoadingTrabajos, fetchTrabajos } = useTrabajosStore((s) => ({
    isLoading: s.isLoading,
    fetchTrabajos: s.fetchTrabajos,
  }))

  // F-026: Load all rodeo events so CostoKiloWidget can compute costo por kilo
  const fetchAllEventosRodeo = useRodeoStore(s => s.fetchAllEventosRodeo)

  useEffect(() => {
    if (!user) return
    void fetchCompras(user.tenantId)
    void fetchProveedores(user.tenantId)
    void fetchTrabajos(user.tenantId)
    // F-005: Load all eventos so imputacion engine can compute costs per lote
    void fetchAllEventos(user.tenantId)
    // F-015: Load productos so EvolucionGastosWidget can map items to categories
    void fetchProductos(user.tenantId)
    // F-026: Load all rodeo events so CostoKiloWidget can compute costo por kilo
    void fetchAllEventosRodeo(user.tenantId)
  }, [user, fetchCompras, fetchProveedores, fetchTrabajos, fetchAllEventos, fetchProductos, fetchAllEventosRodeo])

  const { t } = useTranslation('dashboard')

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
          {t('welcome', { name: user?.name ?? 'usuario' })}
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
          {/* F-022: Finance alerts banner — shown above widgets when thresholds are breached */}
          <FinanceAlertsBanner alerts={alerts} onDismiss={dismissAlert} />
          <GastoProveedorWidget />
          <CostoLotesWidget />
          <CashflowWidget />
          {/* F-015: Evolucion de Gastos — stacked AreaChart by insumo category */}
          <EvolucionGastosWidget />
          {/* F-026: Costo por Kilo Ganadero — efficiency widget for livestock lotes */}
          <CostoKiloWidget />
          {/* F-022: Collapsible config panel for alert thresholds */}
          <FinanceAlertsConfig />

          {/* F-028: Link to bank/credit report */}
          <div className="flex justify-center pt-2">
            <Link
              to="/reporte-bancario"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-field-green border border-field-green rounded-sm hover:bg-field-green hover:text-white transition-colors duration-150"
            >
              📄 Generar Reporte Bancario
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
