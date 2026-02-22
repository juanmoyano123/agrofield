/**
 * F-007: CostoLotesChart — Horizontal bar chart showing cost per lote.
 *
 * Supports two metrics:
 *   - 'total'  → costoTotal (absolute ARS cost for the period)
 *   - 'porHa'  → costoPorHa (ARS per hectare)
 *
 * Top-ranked lote bar is rendered in field-green (#4A7C59);
 * all others use copper (#B5763A), matching the GastoProveedorChart pattern.
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import type { CostoLoteRow } from '../../lib/dashboard-utils'

interface CostoLotesChartProps {
  data: CostoLoteRow[]
  metric: 'total' | 'porHa'
}

// Design system palette
const COLOR_PRIMARY = '#4A7C59'   // field-green — top lote
const COLOR_SECONDARY = '#B5763A' // copper — remaining lotes

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function CostoLotesChart({ data, metric }: CostoLotesChartProps) {
  if (data.length === 0) return null

  const dataKey: keyof CostoLoteRow = metric === 'total' ? 'costoTotal' : 'costoPorHa'
  const tooltipLabel = metric === 'total' ? 'Costo total' : 'Costo por ha'

  // Minimum 200px height; 48px per row gives comfortable breathing room
  const chartHeight = Math.max(200, data.length * 48)

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatARS(v)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={120}
            tick={{ fontSize: 12, fill: 'var(--color-text-dim, #555)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(74,124,89,0.08)' }}
            formatter={(v: number | undefined) => [
              v != null ? formatARS(v) : '—',
              tooltipLabel,
            ]}
            labelStyle={{ fontWeight: 600, fontSize: 13 }}
            contentStyle={{
              borderRadius: '4px',
              border: '1px solid #D6CCB8',
              background: '#FDFAF4',
              fontSize: 12,
            }}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? COLOR_PRIMARY : COLOR_SECONDARY} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
