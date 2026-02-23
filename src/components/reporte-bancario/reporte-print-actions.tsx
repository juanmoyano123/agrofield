/**
 * F-028: ReportePrintActions — Sticky action bar with Export PDF and Back buttons.
 *
 * Hidden completely in @media print via the .reporte-print-actions class.
 * The PeriodFilter is rendered here to keep all controls in one place.
 */

import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'
import { PeriodFilter } from '../dashboard/period-filter'
import type { PeriodOption } from '../../lib/dashboard-utils'

interface ReportePrintActionsProps {
  period: PeriodOption
  onPeriodChange: (p: PeriodOption) => void
}

export function ReportePrintActions({ period, onPeriodChange }: ReportePrintActionsProps) {
  const navigate = useNavigate()

  function handleExport() {
    window.print()
  }

  return (
    <div className="reporte-print-actions bg-surface border-b border-border-warm px-4 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10 shadow-warm-sm">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-150"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <span className="text-border-warm hidden md:inline">|</span>

      <h1 className="text-sm font-semibold text-text-primary hidden md:block">
        Reporte Bancario
      </h1>

      {/* Period filter — flex-grows to fill available space */}
      <div className="flex-1 flex justify-center">
        <PeriodFilter value={period} onChange={onPeriodChange} />
      </div>

      {/* Export PDF button */}
      <button
        type="button"
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-field-green text-white text-sm font-semibold rounded-sm hover:bg-field-green/90 transition-colors duration-150 min-h-[44px]"
      >
        <FileText size={16} />
        <span>Exportar PDF</span>
      </button>
    </div>
  )
}
