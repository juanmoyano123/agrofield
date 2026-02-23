/**
 * F-028: ReporteBancarioPage — Bank/Credit Report page.
 *
 * Orchestrates data loading and renders all report sections.
 * Uses window.print() via the action bar for PDF export (zero dependencies).
 * Hidden chrome in @media print is handled by src/styles/print.css.
 *
 * Data flow:
 *   Stores → useMemo computations → presentation components (pure props)
 */

import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useAuth } from '../hooks/use-auth'
import { useCompras } from '../hooks/use-compras'
import { useEventos } from '../hooks/use-eventos'
import { useLotesStore } from '../stores/lotes-store'
import { useTrabajosStore } from '../stores/contratistas-store'
import {
  computeCostosAllLotesByPeriod,
  computeCashflow,
  computeGastoPorProveedor,
  type PeriodOption,
} from '../lib/dashboard-utils'
import {
  computeResumenGeneral,
  computeActividadResumen,
} from '../lib/reporte-bancario-utils'
import { Spinner } from '../components/ui/spinner'
import { ReportePrintActions } from '../components/reporte-bancario/reporte-print-actions'
import { ReporteHeader } from '../components/reporte-bancario/reporte-header'
import { ReporteResumenGeneral } from '../components/reporte-bancario/reporte-resumen-general'
import { ReporteCostosLote } from '../components/reporte-bancario/reporte-costos-lote'
import { ReporteCashflow } from '../components/reporte-bancario/reporte-cashflow'
import { ReporteProveedores } from '../components/reporte-bancario/reporte-proveedores'
import { ReporteActividad } from '../components/reporte-bancario/reporte-actividad'

/** Human-readable period labels for the report header */
const PERIOD_LABELS: Record<PeriodOption, string> = {
  'this-month': 'Este mes',
  'last-3': 'Últimos 3 meses',
  'last-6': 'Últimos 6 meses',
  'this-year': 'Este año',
  'all': 'Todo el historial',
}

export function ReporteBancarioPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<PeriodOption>('this-year')

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { isLoading: isLoadingCompras, fetchCompras, fetchProveedores } = useCompras()
  const { fetchAllEventos } = useEventos()
  const { isLoading: isLoadingTrabajos, fetchTrabajos } = useTrabajosStore(
    useShallow(s => ({ isLoading: s.isLoading, fetchTrabajos: s.fetchTrabajos })),
  )

  useEffect(() => {
    if (!user) return
    void fetchCompras(user.tenantId)
    void fetchProveedores(user.tenantId)
    void fetchTrabajos(user.tenantId)
    void fetchAllEventos(user.tenantId)
  }, [user, fetchCompras, fetchProveedores, fetchTrabajos, fetchAllEventos])

  // ── Store slices ───────────────────────────────────────────────────────────
  const compras = useCompras().compras
  const eventos = useEventos().eventos
  const lotes = useLotesStore(
    useShallow(s => s.lotes.filter(l => !l.deletedAt)),
  )
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos))

  // ── Memoized computations ──────────────────────────────────────────────────
  const resumenGeneral = useMemo(
    () => computeResumenGeneral(lotes, compras, trabajos, period),
    [lotes, compras, trabajos, period],
  )

  const costosLote = useMemo(
    () => computeCostosAllLotesByPeriod(
      lotes.map(l => ({ id: l.id, nombre: l.nombre, hectareas: l.hectareas })),
      eventos,
      trabajos,
      period,
    ),
    [lotes, eventos, trabajos, period],
  )

  const cashflow = useMemo(
    () => computeCashflow(compras, trabajos, period, 'ARS'),
    [compras, trabajos, period],
  )

  const proveedores = useMemo(
    () => computeGastoPorProveedor(compras, period),
    [compras, period],
  )

  const actividad = useMemo(
    () => computeActividadResumen(eventos, period),
    [eventos, period],
  )

  const hasData =
    resumenGeneral.cantidadLotes > 0 ||
    costosLote.length > 0 ||
    cashflow.mensual.length > 0 ||
    proveedores.length > 0 ||
    actividad.totalEventos > 0

  const isLoading = isLoadingCompras || isLoadingTrabajos

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment">
      {/* Sticky action bar — hidden in print via .reporte-print-actions class */}
      <ReportePrintActions period={period} onPeriodChange={setPeriod} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasData && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-4xl mb-4">📄</p>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            No hay datos para el período seleccionado
          </h2>
          <p className="text-text-muted text-sm">
            Probá seleccionando un período más amplio (por ejemplo, "Este año" o "Todo").
          </p>
        </div>
      )}

      {/* Report content — full width in print, max-width on screen */}
      {!isLoading && hasData && (
        <div className="reporte-content max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Cover / header */}
          <ReporteHeader
            tenantName={user?.tenantName ?? ''}
            userName={user?.name ?? ''}
            periodoLabel={PERIOD_LABELS[period]}
          />

          {/* Executive summary KPIs */}
          <ReporteResumenGeneral data={resumenGeneral} />

          {/* Cost per lot table */}
          <ReporteCostosLote rows={costosLote} />

          {/* Monthly cashflow table */}
          <ReporteCashflow data={cashflow} />

          {/* Top suppliers table */}
          <ReporteProveedores items={proveedores} />

          {/* Productive activity summary */}
          <ReporteActividad data={actividad} />

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">
              Generado por AgroField — agrofield.com.ar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
