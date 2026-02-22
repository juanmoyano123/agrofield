/**
 * F-005: Motor de Imputacion — React hooks for derived cost data.
 *
 * useImputacionGlobal: returns a Map<loteId, CostoLote> recomputed only
 * when lotes, eventos, or trabajos arrays actually change (stable references
 * via useShallow).
 *
 * useImputacionLote: per-lote hook returning both aggregate CostoLote and
 * the sorted detail LineaCosto[].
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../stores/lotes-store'
import { useEventosStore } from '../stores/eventos-store'
import { useTrabajosStore } from '../stores/contratistas-store'
import {
  computeCostosAllLotes,
  computeCostoLote,
  buildLineasCosto,
  type CostoLote,
  type LineaCosto,
} from '../lib/imputacion-utils'

/**
 * Returns a Map<loteId, CostoLote> covering all active lotes.
 *
 * The Map is recreated via useMemo only when the underlying arrays change.
 * useShallow prevents unnecessary re-renders when Zustand snapshots are
 * referentially equal in shallow comparison.
 *
 * NOTE: Maps do not trigger React re-renders on their own — consumers must
 * read individual entries rather than passing the Map as a prop to memoized
 * children without care.
 */
export function useImputacionGlobal(): Map<string, CostoLote> {
  // Slice only active (non-deleted) records to keep comparisons stable
  const lotes = useLotesStore(useShallow(s => s.lotes.filter(l => !l.deletedAt)))
  const eventos = useEventosStore(useShallow(s => s.eventos.filter(e => !e.deletedAt)))
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos.filter(t => !t.deletedAt)))

  return useMemo(
    () => computeCostosAllLotes(lotes, eventos, trabajos),
    [lotes, eventos, trabajos],
  )
}

/**
 * Returns cost breakdown and line-item detail for a single lote.
 *
 * @param loteId - The lote's unique identifier
 * @param hectareas - Surface area used for $/ha calculation
 */
export function useImputacionLote(
  loteId: string,
  hectareas: number,
): { costo: CostoLote; lineas: LineaCosto[] } {
  const eventos = useEventosStore(useShallow(s => s.eventos.filter(e => !e.deletedAt)))
  const trabajos = useTrabajosStore(useShallow(s => s.trabajos.filter(t => !t.deletedAt)))

  const costo = useMemo(
    () => computeCostoLote(loteId, hectareas, eventos, trabajos),
    [loteId, hectareas, eventos, trabajos],
  )

  const lineas = useMemo(
    () => buildLineasCosto(loteId, eventos, trabajos),
    [loteId, eventos, trabajos],
  )

  return { costo, lineas }
}
