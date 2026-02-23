/**
 * F-027: use-comparativa — Orchestrates data fetching and computation for the
 * Comparativa page.
 *
 * Reads lotes, eventos, trabajos from their stores and memoizes the computed
 * ComparativaCampanaData[] for the selected campañas.
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useLotesStore } from '../stores/lotes-store'
import { useEventosStore } from '../stores/eventos-store'
import { useTrabajosStore } from '../stores/contratistas-store'
import { useCampanasStore } from '../stores/campanas-store'
import { computeComparativa, type ComparativaCampanaData } from '../lib/comparativa-utils'
import type { Campana, Evento, TrabajoContratista } from '../types'

interface UseComparativaReturn {
  campanas: Campana[]
  isLoading: boolean
  computedData: ComparativaCampanaData[]
  eventos: Evento[]
  trabajos: TrabajoContratista[]
}

/**
 * @param selectedIds - IDs of campañas to compute metrics for
 */
export function useComparativa(selectedIds: string[]): UseComparativaReturn {
  const campanas = useCampanasStore(s => s.campanas)

  const lotes = useLotesStore(
    useShallow(s =>
      s.lotes
        .filter(l => !l.deletedAt)
        .map(l => ({ id: l.id, nombre: l.nombre, hectareas: l.hectareas })),
    ),
  )
  const lotesLoading = useLotesStore(s => s.isLoading)

  const eventos = useEventosStore(useShallow(s => s.eventos))
  const eventosLoading = useEventosStore(s => s.isLoading)

  const trabajos = useTrabajosStore(useShallow(s => s.trabajos))
  const trabajosLoading = useTrabajosStore(s => s.isLoading)

  const isLoading = lotesLoading || eventosLoading || trabajosLoading

  // Filter to selected campañas in selection order
  const selectedCampanas = useMemo(
    () => selectedIds
      .map(id => campanas.find(c => c.id === id))
      .filter((c): c is Campana => c !== undefined),
    [campanas, selectedIds],
  )

  // Memoized computation — only recalculates when inputs change
  const computedData = useMemo(
    () => computeComparativa(selectedCampanas, lotes, eventos, trabajos),
    [selectedCampanas, lotes, eventos, trabajos],
  )

  return { campanas, isLoading, computedData, eventos, trabajos }
}
