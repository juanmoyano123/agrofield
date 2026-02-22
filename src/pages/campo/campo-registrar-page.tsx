/**
 * CampoRegistrarPage — quick event registration form for Encargado de Campo.
 *
 * UX flow:
 * 1. Header shows back button + lote name.
 * 2. 2x2 grid of tipo buttons (aplicacion / siembra / cosecha / otro).
 * 3. Date input (pre-filled today, editable).
 * 4. Optional insumo section: product select + quantity input.
 * 5. Optional notes textarea.
 * 6. Full-width "REGISTRAR EVENTO" submit button (min 56 px).
 * 7. On success: animated green checkmark + action buttons.
 *
 * F-013: Powered by React Hook Form + campoEventoSchema (Zod).
 * Responsable is auto-set to user.name — the encargado does not need
 * to pick a responsible person.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useLotes } from '../../hooks/use-lotes'
import { useEventos } from '../../hooks/use-eventos'
import { useStock } from '../../hooks/use-stock'
import { campoEventoSchema, type CampoEventoSchema } from '../../lib/validations/campo-evento-schema'
import { DateInput } from '../../components/ui/date-input'
import { Spinner } from '../../components/ui/spinner'
import type { Lote } from '../../types'

// ─── Tipo button config ──────────────────────────────────────────────────────

const TIPOS = [
  { value: 'aplicacion', label: 'Aplicacion' },
  { value: 'siembra', label: 'Siembra' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'otro', label: 'Otro' },
] as const

// ─── Component ───────────────────────────────────────────────────────────────

export function CampoRegistrarPage() {
  const { loteId } = useParams<{ loteId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lotes, fetchLotes } = useLotes()
  const { createEvento, isSaving } = useEventos()
  const { productos, fetchStock } = useStock()

  const [success, setSuccess] = useState(false)

  // Find the lote from the store (may already be cached)
  const lote: Lote | undefined = lotes.find(l => l.id === loteId)

  // Fetch if not cached yet
  useEffect(() => {
    if (user?.tenantId && lotes.length === 0) {
      fetchLotes(user.tenantId)
    }
  }, [user?.tenantId, lotes.length, fetchLotes])

  // Fetch productos for the insumo selector
  useEffect(() => {
    if (user?.tenantId && productos.length === 0) {
      fetchStock(user.tenantId)
    }
  }, [user?.tenantId, productos.length, fetchStock])

  // ── Form ──────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampoEventoSchema>({
    resolver: zodResolver(campoEventoSchema) as Resolver<CampoEventoSchema>,
    defaultValues: {
      loteId: loteId ?? '',
      fecha: getTodayISO(),
    },
  })

  const selectedTipo = watch('tipo')
  const selectedProductoId = watch('insumoProductoId')

  // ── Submit ────────────────────────────────────────────────────────────────

  async function onSubmit(data: CampoEventoSchema) {
    if (!user?.tenantId || !loteId) return

    // Build insumos array for the evento (only if product selected)
    const producto = productos.find(p => p.id === data.insumoProductoId)
    const insumos =
      producto && data.insumoCantidad
        ? [
            {
              productoId: producto.id,
              productoName: producto.name,
              cantidad: data.insumoCantidad,
              unidad: producto.unidad,
              costoUnitario: producto.precioPromedio ?? 0,
              subtotal: (data.insumoCantidad ?? 0) * (producto.precioPromedio ?? 0),
            },
          ]
        : []

    await createEvento(
      {
        tipo: data.tipo,
        fecha: data.fecha,
        insumos,
        responsable: user.name,
        notas: data.notas,
      },
      loteId,
      user.tenantId,
    )

    setSuccess(true)
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        {/* Animated checkmark */}
        <span className="animate-bounce text-field-green">
          <CheckCircle size={64} strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-text-primary font-semibold text-xl">Registrado!</p>
          <p className="text-text-muted text-sm mt-1">El evento fue guardado correctamente.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="bg-field-green text-white min-h-[56px] w-full rounded-sm text-base font-semibold hover:bg-field-green/90 transition-colors"
          >
            Registrar otro
          </button>
          <button
            type="button"
            onClick={() => navigate('/campo')}
            className="bg-surface border border-border-warm text-text-primary min-h-[56px] w-full rounded-sm text-base font-semibold hover:bg-parchment transition-colors"
          >
            Volver a Lotes
          </button>
        </div>
      </div>
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (lotes.length > 0 && !lote) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-text-muted">Lote no encontrado.</p>
        <button
          type="button"
          onClick={() => navigate('/campo')}
          className="text-field-green underline text-sm"
        >
          Volver
        </button>
      </div>
    )
  }

  // ── Form UI ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/campo')}
          aria-label="Volver a Lotes"
          className="text-text-muted hover:text-text-primary transition-colors min-h-[44px] -ml-1 pr-2 flex items-center"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-text-primary font-semibold text-lg leading-tight">
            {lote ? lote.nombre : 'Cargando...'}
          </h1>
          <p className="text-text-muted text-xs">Nuevo evento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Hidden loteId field */}
        <input type="hidden" {...register('loteId')} />

        {/* ── Tipo de evento — 2x2 grid ────────────────────────────────── */}
        <div>
          <p className="text-text-primary text-sm font-medium mb-2">Tipo de evento</p>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map(({ value, label }) => {
              const isSelected = selectedTipo === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('tipo', value, { shouldValidate: true })}
                  className={`min-h-[64px] rounded-sm border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-field-green text-white border-field-green'
                      : 'bg-surface text-text-primary border-border-warm hover:border-field-green hover:text-field-green'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {errors.tipo && (
            <p className="text-error text-xs mt-1">{errors.tipo.message}</p>
          )}
        </div>

        {/* ── Fecha ────────────────────────────────────────────────────── */}
        <DateInput
          label="Fecha"
          error={errors.fecha?.message}
          {...register('fecha')}
        />

        {/* ── Insumo (opcional) ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-text-primary text-sm font-medium">Insumo (opcional)</p>

          {/* Product select */}
          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs">Producto</label>
            <select
              {...register('insumoProductoId')}
              className="w-full border border-border-warm rounded-sm bg-surface text-text-primary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-green/40 min-h-[44px]"
            >
              <option value="">-- Sin insumo --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unidad})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity — only shown when a product is selected */}
          {selectedProductoId && (
            <div className="flex flex-col gap-1">
              <label className="text-text-muted text-xs">
                Cantidad (
                {productos.find(p => p.id === selectedProductoId)?.unidad ?? ''})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register('insumoCantidad')}
                className="w-full border border-border-warm rounded-sm bg-surface text-text-primary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-field-green/40 min-h-[44px]"
              />
              {errors.insumoCantidad && (
                <p className="text-error text-xs">{errors.insumoCantidad.message}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Notas (opcional) ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className="text-text-primary text-sm font-medium">Notas (opcional)</label>
          <textarea
            {...register('notas')}
            rows={3}
            placeholder="Observaciones del campo..."
            className="w-full border border-border-warm rounded-sm bg-surface text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-field-green/40 resize-none"
          />
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSaving}
          className="bg-field-green text-white min-h-[56px] w-full rounded-sm text-base font-bold tracking-wide hover:bg-field-green/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" />
              Guardando...
            </>
          ) : (
            'REGISTRAR EVENTO'
          )}
        </button>
      </form>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
