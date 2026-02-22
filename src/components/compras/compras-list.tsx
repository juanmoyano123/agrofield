import { useMemo } from 'react'
import type { Compra } from '../../types'
import { CompraCard } from './compra-card'
import { EmptyState } from '../ui/empty-state'

interface ComprasListProps {
  compras: Compra[]
  onAddClick: () => void
}

interface MonthGroup {
  key: string
  label: string
  compras: Compra[]
  total: number
}

function getMonthKey(dateStr: string): string {
  // dateStr format: YYYY-MM-DD
  const parts = dateStr.split('-')
  return `${parts[0] ?? ''}-${parts[1] ?? ''}`
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year ?? 2026, (month ?? 1) - 1, 1)
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function ComprasList({ compras, onAddClick }: ComprasListProps) {
  const monthGroups = useMemo<MonthGroup[]>(() => {
    if (compras.length === 0) return []

    const groupMap = new Map<string, Compra[]>()

    for (const compra of compras) {
      const key = getMonthKey(compra.fecha)
      const existing = groupMap.get(key) ?? []
      existing.push(compra)
      groupMap.set(key, existing)
    }

    // Sort months descending (most recent first)
    const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => b.localeCompare(a))

    return sortedKeys.map(key => {
      const groupCompras = (groupMap.get(key) ?? []).sort(
        (a, b) => b.fecha.localeCompare(a.fecha)
      )
      // Only sum ARS for month total (mixed currencies would need separate buckets)
      const total = groupCompras.reduce(
        (sum, c) => sum + (c.moneda === 'ARS' ? c.total : 0),
        0,
      )
      return {
        key,
        label: getMonthLabel(key),
        compras: groupCompras,
        total,
      }
    })
  }, [compras])

  if (compras.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="No hay compras registradas"
        description="Registrá tu primera compra de insumos para llevar un control preciso de tus gastos."
        action={{ label: 'Registrar compra', onClick: onAddClick }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {monthGroups.map(group => (
        <div key={group.key} className="flex flex-col gap-3">
          {/* Month header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide capitalize">
              {group.label}
            </h2>
            <span className="text-sm font-semibold text-neutral-500">
              Total ARS: {formatAmount(group.total)}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3">
            {group.compras.map(compra => (
              <CompraCard key={compra.id} compra={compra} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
