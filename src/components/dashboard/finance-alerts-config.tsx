import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useFinanceAlertsStore } from '../../stores/finance-alerts-store'

/**
 * Collapsible panel that lets the user configure optional financial alert
 * thresholds. Each threshold has a checkbox toggle — when unchecked the
 * threshold is cleared (set to null) so no alert fires.
 *
 * Thresholds are persisted via finance-alerts-store (localStorage) so they
 * survive page reloads. Dismissed alerts are NOT persisted (session-only).
 */
export function FinanceAlertsConfig() {
  const [open, setOpen] = useState(false)

  const { gastoMensualMax, costoPorHaMax, cashflowNetoMin,
    setGastoMensualMax, setCostoPorHaMax, setCashflowNetoMin } =
    useFinanceAlertsStore()

  // Local draft values for the inputs while the user types
  const [draftGasto, setDraftGasto] = useState<string>(
    gastoMensualMax !== null ? String(gastoMensualMax) : '',
  )
  const [draftCostoPorHa, setDraftCostoPorHa] = useState<string>(
    costoPorHaMax !== null ? String(costoPorHaMax) : '',
  )
  const [draftCashflowMin, setDraftCashflowMin] = useState<string>(
    cashflowNetoMin !== null ? String(cashflowNetoMin) : '',
  )

  // Toggle states derive from whether the threshold is currently set
  const [gastoEnabled, setGastoEnabled] = useState(gastoMensualMax !== null)
  const [costoEnabled, setCostoEnabled] = useState(costoPorHaMax !== null)
  const [cashflowEnabled, setCashflowEnabled] = useState(cashflowNetoMin !== null)

  function handleGastoToggle(checked: boolean) {
    setGastoEnabled(checked)
    if (!checked) {
      setGastoMensualMax(null)
    } else {
      const v = parseFloat(draftGasto)
      if (!isNaN(v) && v > 0) setGastoMensualMax(v)
    }
  }

  function handleCostoToggle(checked: boolean) {
    setCostoEnabled(checked)
    if (!checked) {
      setCostoPorHaMax(null)
    } else {
      const v = parseFloat(draftCostoPorHa)
      if (!isNaN(v) && v > 0) setCostoPorHaMax(v)
    }
  }

  function handleCashflowToggle(checked: boolean) {
    setCashflowEnabled(checked)
    if (!checked) {
      setCashflowNetoMin(null)
    } else {
      const v = parseFloat(draftCashflowMin)
      if (!isNaN(v)) setCashflowNetoMin(v)
    }
  }

  function handleGastoChange(raw: string) {
    setDraftGasto(raw)
    if (!gastoEnabled) return
    const v = parseFloat(raw)
    setGastoMensualMax(!isNaN(v) && v > 0 ? v : null)
  }

  function handleCostoChange(raw: string) {
    setDraftCostoPorHa(raw)
    if (!costoEnabled) return
    const v = parseFloat(raw)
    setCostoPorHaMax(!isNaN(v) && v > 0 ? v : null)
  }

  function handleCashflowChange(raw: string) {
    setDraftCashflowMin(raw)
    if (!cashflowEnabled) return
    const v = parseFloat(raw)
    setCashflowNetoMin(!isNaN(v) ? v : null)
  }

  return (
    <div className="bg-parchment rounded-sm border border-border-warm">
      {/* Header — always visible, toggles the panel open/closed */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-text-primary hover:text-field-green transition-colors duration-200"
        aria-expanded={open}
      >
        <span>Configurar alertas financieras</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border-warm pt-4">
          <p className="text-xs text-text-muted">
            Recibis una alerta en el dashboard cuando alguno de estos valores supera (o cae bajo) el umbral configurado.
            Los umbrales se guardan entre sesiones.
          </p>

          {/* Gasto mensual ARS */}
          <div className="flex items-start gap-3">
            <input
              id="toggle-gasto"
              type="checkbox"
              checked={gastoEnabled}
              onChange={e => handleGastoToggle(e.target.checked)}
              className="mt-0.5 accent-error cursor-pointer"
            />
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="toggle-gasto" className="text-sm font-medium text-text-primary cursor-pointer">
                Avisar si gasto mensual ARS supera
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">$</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  disabled={!gastoEnabled}
                  value={draftGasto}
                  onChange={e => handleGastoChange(e.target.value)}
                  placeholder="Ej: 500000"
                  className="flex-1 text-sm border border-border-warm rounded-sm px-2 py-1 bg-white text-text-primary disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-error/40"
                />
              </div>
            </div>
          </div>

          {/* Costo por ha */}
          <div className="flex items-start gap-3">
            <input
              id="toggle-costo"
              type="checkbox"
              checked={costoEnabled}
              onChange={e => handleCostoToggle(e.target.checked)}
              className="mt-0.5 accent-warning cursor-pointer"
            />
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="toggle-costo" className="text-sm font-medium text-text-primary cursor-pointer">
                Avisar si costo/ha de algún lote supera
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">$</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  disabled={!costoEnabled}
                  value={draftCostoPorHa}
                  onChange={e => handleCostoChange(e.target.value)}
                  placeholder="Ej: 20000"
                  className="flex-1 text-sm border border-border-warm rounded-sm px-2 py-1 bg-white text-text-primary disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-warning/40"
                />
                <span className="text-sm text-text-muted">/ha</span>
              </div>
            </div>
          </div>

          {/* Cashflow neto mínimo */}
          <div className="flex items-start gap-3">
            <input
              id="toggle-cashflow"
              type="checkbox"
              checked={cashflowEnabled}
              onChange={e => handleCashflowToggle(e.target.checked)}
              className="mt-0.5 accent-warning cursor-pointer"
            />
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="toggle-cashflow" className="text-sm font-medium text-text-primary cursor-pointer">
                Avisar si saldo neto mensual cae por debajo de
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">$</span>
                <input
                  type="number"
                  step={1000}
                  disabled={!cashflowEnabled}
                  value={draftCashflowMin}
                  onChange={e => handleCashflowChange(e.target.value)}
                  placeholder="Ej: -100000"
                  className="flex-1 text-sm border border-border-warm rounded-sm px-2 py-1 bg-white text-text-primary disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-warning/40"
                />
              </div>
              <p className="text-[11px] text-text-muted">
                El saldo neto suele ser negativo (egresos sin ingresos registrados). Usá un valor negativo como umbral, ej: -200000.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
