/**
 * F-026: CostoKiloChart — Horizontal bar chart for costo por kilo ganadero.
 *
 * Supports three metrics:
 *   - 'porKg'  → costoPorKg (ARS per kg produced)
 *   - 'porCab' → costoPorCab (ARS per head)
 *   - 'total'  → costosTotales (absolute ARS cost)
 *
 * Top lote bar is rendered in field-green (#4A7C59);
 * all others use copper (#B5763A), matching the existing chart pattern.
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
import type { CostoKiloLote } from '../../lib/costo-kilo-utils'

interface CostoKiloChartProps {
  data: CostoKiloLote[]
  metric: 'porKg' | 'porCab' | 'total'
}

const COLOR_PRIMARY = '#4A7C59'   // field-green — top lote
const COLOR_SECONDARY = '#B5763A' // copper — remaining lotes

function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

const METRIC_KEY: Record<CostoKiloChartProps['metric'], keyof CostoKiloLote> = {
  porKg: 'costoPorKg',
  porCab: 'costoPorCab',
  total: 'costosTotales',
}

const METRIC_LABEL: Record<CostoKiloChartProps['metric'], string> = {
  porKg: 'Costo por kg',
  porCab: 'Costo por cabeza',
  total: 'Costo total',
}

export function CostoKiloChart({ data, metric }: CostoKiloChartProps) {
  if (data.length === 0) return null

  const dataKey = METRIC_KEY[metric]
  const tooltipLabel = METRIC_LABEL[metric]
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
